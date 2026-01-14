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
      const amount = Number(dto.amount);
      const newBalance = (currentBalance + amount).toFixed(4);

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

      // update wallet balance and increment version
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

      // Determine balance adjustment
      let balanceChange = 0;

      if (prevStatus !== 'SUCCESS' && newStatus === 'SUCCESS') {
        // Previously not applied, now apply the transaction amount
        balanceChange = newAmount;
      } else if (prevStatus === 'SUCCESS' && newStatus !== 'SUCCESS') {
        // Previously applied, now reverting it
        balanceChange = -prevAmount;
      } else if (prevStatus === 'SUCCESS' && newStatus === 'SUCCESS' && newAmount !== prevAmount) {
        // Amount changed while already applied -> apply difference
        balanceChange = newAmount - prevAmount;
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

  async findWalletById(walletId: string) {
    if (!walletId) return null;
    return this.walletModel.findByPk(walletId);
  }

  async listTransactions(walletId: string) {
    return this.walletTxnModel.findAll({ where: { walletId }, order: [['createdAt', 'DESC']] });
  }
}
