import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Wallet } from '../models/wallet.model';
import { WalletTransaction } from '../models/wallet-transaction.model';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet) private readonly walletModel: typeof Wallet,
    @InjectModel(WalletTransaction)
    private readonly walletTxnModel: typeof WalletTransaction,
    private readonly sequelize: Sequelize,
  ) {}

  async findByUserId(userId: string) {
    return this.walletModel.findOne({ where: { userId } });
  }

  async findOrCreateForUser(userId: string) {
    let wallet = await this.findByUserId(userId);
    if (!wallet) {
      wallet = await this.walletModel.create({ userId });
    }
    return wallet;
  }

  /**
   * Compute the balance delta based on transaction type and amount.
   * CREDIT / REFUND => +abs(amount)
   * DEBIT => -abs(amount)
   * TRANSFER => respect amount sign (positive credit, negative debit)
   * default => respect amount sign
   */
  private computeDelta(type: string, amount: number) {
    const t = (type ?? '').toString().toUpperCase();
    const a = Number(amount) || 0;
    const abs = Math.abs(a);
    switch (t) {
      case 'CREDIT':
      case 'REFUND':
        return abs;
      case 'DEBIT':
        return -abs;
      case 'TRANSFER':
        return a; // respect sign
      default:
        return a;
    }
  }

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    // Use DB transaction to ensure consistent balance update
    const t = await this.sequelize.transaction();
    try {
      // Lock wallet row
      let wallet = await this.walletModel.findOne({ where: { userId }, transaction: t, lock: true });
      if (!wallet) {
        wallet = await this.walletModel.create({ userId }, { transaction: t });
      }

      const currentBalance = parseFloat(String(wallet.balance || '0'));
      const delta = this.computeDelta(dto.type, Number(dto.amount));
      const newBalance = (currentBalance + delta).toFixed(4);

      // create transaction record with status PENDING
      const txn = await this.walletTxnModel.create(
        {
          walletId: wallet.id,
          amount: dto.amount,
          type: dto.type,
          status: 'PENDING',
          referenceId: dto.referenceId ?? null,
          description: dto.description ?? null,
        },
        { transaction: t },
      );

      // update wallet balance and increment version using computed delta
      await wallet.update({ balance: newBalance }, { transaction: t });
      await wallet.increment('version', { by: 1, transaction: t });

      // mark txn success
      await txn.update({ status: 'SUCCESS' }, { transaction: t });

      await t.commit();

      return txn;
    } catch (error) {
      await t.rollback();
      throw new InternalServerErrorException(error?.message || 'Transaction failed');
    }
  }

  /**
   * Create a transaction in PENDING state without affecting wallet balance.
   * Wallet will be created if it doesn't exist; funding happens later when status is updated to SUCCESS.
   */
  async createTransactionPending(userId: string, dto: CreateTransactionDto) {
    const t = await this.sequelize.transaction();
    try {
      let wallet = await this.walletModel.findOne({ where: { userId }, transaction: t, lock: true });
      if (!wallet) {
        wallet = await this.walletModel.create({ userId }, { transaction: t });
      }

      const txn = await this.walletTxnModel.create(
        {
          walletId: wallet.id,
          amount: dto.amount,
          type: dto.type,
          status: 'PENDING',
          referenceId: dto.referenceId ?? null,
          description: dto.description ?? null,
        },
        { transaction: t },
      );

      await t.commit();
      return txn;
    } catch (error) {
      await t.rollback();
      throw new InternalServerErrorException(error?.message || 'Failed to create pending transaction');
    }
  }

  async updateTransaction(
    transactionId: string,
    updates: {
      status?: string;
      amount?: number;
      type?: string;
      referenceId?: string | null;
      description?: string | null;
    },
  ) {
    const t = await this.sequelize.transaction();
    try {
      const txn = await this.walletTxnModel.findByPk(transactionId, { transaction: t, lock: true });
      if (!txn) throw new NotFoundException('Transaction not found');

      const prevStatus = txn.status;
      const prevAmount = parseFloat(String(txn.amount || '0'));
      const newStatus = updates.status ?? prevStatus;
      const newAmount = updates.amount !== undefined ? Number(updates.amount) : prevAmount;

      // If nothing changes, return early
      if (
        prevStatus === newStatus &&
        Number(prevAmount) === Number(newAmount) &&
        (updates.type === undefined || updates.type === txn.type) &&
        (updates.referenceId === undefined || updates.referenceId === txn.referenceId) &&
        (updates.description === undefined || updates.description === txn.description)
      ) {
        await t.commit();
        return txn;
      }

      // Ensure wallet exists and lock it for balance changes
      const wallet = await this.walletModel.findByPk(txn.walletId, { transaction: t, lock: true });
      if (!wallet) throw new NotFoundException('Wallet not found');

      // Determine balance adjustment using transaction type and updated amounts
      const prevType = txn.type ?? '';
      const newType = updates.type ?? txn.type;
      const oldDelta = this.computeDelta(prevType, prevAmount);
      const newDelta = this.computeDelta(newType, newAmount);

      let balanceChange = 0;
      if (prevStatus !== 'SUCCESS' && newStatus === 'SUCCESS') {
        balanceChange = newDelta;
      } else if (prevStatus === 'SUCCESS' && newStatus !== 'SUCCESS') {
        balanceChange = -oldDelta;
      } else if (prevStatus === 'SUCCESS' && newStatus === 'SUCCESS') {
        balanceChange = newDelta - oldDelta;
      }

      if (balanceChange !== 0) {
        const currentBalance = parseFloat(String(wallet.balance || '0'));
        const updatedBalance = (currentBalance + balanceChange).toFixed(4);
        await wallet.update({ balance: updatedBalance }, { transaction: t });
        await wallet.increment('version', { by: 1, transaction: t });
      }

      // Update transaction record
      await txn.update(
        {
          amount: newAmount,
          status: newStatus,
          type: updates.type ?? txn.type,
          referenceId: updates.referenceId ?? txn.referenceId,
          description: updates.description ?? txn.description,
        },
        { transaction: t },
      );

      await t.commit();
      // reload to get latest DB values
      return await txn.reload();
    } catch (error) {
      await t.rollback();
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error?.message || 'Update failed');
    }
  }

  async findTransactionByReference(referenceId: string) {
    if (!referenceId) return null;
    return this.walletTxnModel.findOne({ where: { referenceId } });
  }

  /**
   * Update only the status of a transaction. If status transitions to SUCCESS,
   * the wallet will be funded atomically.
   */
  async updateTransactionStatus(transactionId: string, status: string) {
    if (!status) throw new BadRequestException('Status is required');
    const t = await this.sequelize.transaction();
    try {
      const txn = await this.walletTxnModel.findByPk(transactionId, { transaction: t, lock: true });
      if (!txn) throw new NotFoundException('Transaction not found');

      const prevStatus = txn.status;
      const newStatus = status.toUpperCase();

      if (prevStatus === newStatus) {
        await t.commit();
        return txn;
      }

      // Compute balance delta based on transaction type and amount
      // Types: DEBIT (-), CREDIT (+), REFUND (+), TRANSFER (use amount sign)
      const wallet = await this.walletModel.findByPk(txn.walletId, { transaction: t, lock: true });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const currentBalance = parseFloat(String(wallet.balance || '0'));
      const amount = parseFloat(String(txn.amount || '0'));
      const absAmount = Math.abs(amount);
      const type = (txn.type ?? '').toString().toUpperCase();

      let delta = 0;
      switch (type) {
        case 'CREDIT':
        case 'REFUND':
          delta = absAmount;
          break;
        case 'DEBIT':
          delta = -absAmount;
          break;
        case 'TRANSFER':
          // For transfers, respect the sign of the amount. Positive = credit, negative = debit
          delta = amount;
          break;
        default:
          // Fallback: respect amount sign
          delta = amount;
      }

      if (prevStatus !== 'SUCCESS' && newStatus === 'SUCCESS') {
        // apply delta
        const updatedBalance = (currentBalance + delta).toFixed(4);
        await wallet.update({ balance: updatedBalance }, { transaction: t });
        await wallet.increment('version', { by: 1, transaction: t });
      } else if (prevStatus === 'SUCCESS' && newStatus !== 'SUCCESS') {
        // revert previously applied delta
        const updatedBalance = (currentBalance - delta).toFixed(4);
        await wallet.update({ balance: updatedBalance }, { transaction: t });
        await wallet.increment('version', { by: 1, transaction: t });
      }

      await txn.update({ status: newStatus }, { transaction: t });

      await t.commit();
      return await txn.reload();
    } catch (error) {
      await t.rollback();
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error?.message || 'Update failed');
    }
  }

  async updateTransactionStatusByReference(referenceId: string, status: string) {
    if (!referenceId) throw new BadRequestException('ReferenceId is required');
    const txn = await this.findTransactionByReference(referenceId);
    if (!txn) throw new NotFoundException('Transaction not found for reference');
    return this.updateTransactionStatus(txn.id, status);
  }

  async findWalletById(walletId: string) {
    if (!walletId) return null;
    return this.walletModel.findByPk(walletId);
  }

  async listTransactions(walletId: string) {
    return this.walletTxnModel.findAll({ where: { walletId }, order: [['createdAt', 'DESC']] });
  }
}
