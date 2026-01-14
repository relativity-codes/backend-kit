/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MonnifyNotifications } from '../models/monnify-notification.model';
import { MailService } from '../../email/email.service';
import { UserService } from 'src/user/services/user.service';
import { WalletService } from 'src/wallet/services/wallet.service';

@Injectable()
export class MonnifyNotificationService {
  constructor(
    @InjectModel(MonnifyNotifications)
    private readonly monnifyNotificationsModel: typeof MonnifyNotifications,
    private readonly emailService: MailService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  async saveMonnifyNotification(data: any) {
    try {
      const { eventType, eventData } = data;

      if (!eventType || !eventData) {
        throw new Error('Invalid Monnify notification data');
      }

      const payload = {
        eventType,
        eventData,
        transactionReference: eventData.transactionReference ?? null,
        paymentReference: eventData.paymentReference ?? null,
        amountPaid: eventData.amountPaid ?? null,
        currency: eventData.currency ?? null,
        paidOn: eventData.paidOn ? new Date(eventData.paidOn) : null,
      };

      const saved = await this.monnifyNotificationsModel.create(payload);

      // Map payment status and attempt to update a matching wallet transaction
      try {
        const reference = payload.transactionReference ?? payload.paymentReference ?? null;
        if (reference) {
          const txn = await this.walletService.findTransactionByReference(String(reference));
          if (txn) {
            const incomingStatus = (eventData.paymentStatus ?? '').toString().toLowerCase();
            const mappedStatus = incomingStatus === 'paid' || incomingStatus === 'success' ? 'SUCCESS' : incomingStatus === 'failed' ? 'FAILED' : incomingStatus.toUpperCase() || 'PENDING';

            const updatedTxn = await this.walletService.updateTransaction(txn.id, {
              status: mappedStatus,
              amount: Number(payload.amountPaid ?? txn.amount),
              referenceId: String(reference),
              description: `Monnify ${eventType}`,
            });

            // notify owner (best-effort)
            try {
              const wallet = await this.walletService.findWalletById(String(updatedTxn.walletId));
              if (wallet && wallet.userId) {
                const user = await this.userService.findOneById(String(wallet.userId));
                const to = user.email;
                const subject = `Payment update: ${mappedStatus}`;
                const text = `Hi ${user.username || ''},\n\nYour wallet transaction (${updatedTxn.id}) has been updated to status ${mappedStatus}. Amount: ${updatedTxn.amount}.\n\nThanks.`;
                const html = `<p>Hi ${user.username || ''},</p><p>Your wallet transaction <strong>${updatedTxn.id}</strong> has been updated to status <strong>${mappedStatus}</strong>.</p><p>Amount: ${updatedTxn.amount}</p><p>Thanks.</p>`;
                await this.emailService.sendEmail({ to, subject, text, html });
              }
            } catch (emailErr) {
              console.error('Failed to send Monnify payment notification email:', emailErr);
            }
          }
        }
      } catch (err) {
        console.error('Error mapping Monnify notification to wallet transaction:', err);
      }

      return saved;
    } catch (error) {
      console.error('Error saving Monnify notification:', JSON.stringify({ message: error.message, stack: error.stack, details: error.response || error }));
      throw error;
    }
  }

  async findById(id: string): Promise<MonnifyNotifications | null> {
    try {
      return await this.monnifyNotificationsModel.findByPk(id);
    } catch (error) {
      console.error('Error finding Monnify notification by ID:', error);
      return null;
    }
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<MonnifyNotifications[]> {
    try {
      return await this.monnifyNotificationsModel.findAll({ limit: options?.limit ?? 100, offset: options?.offset ?? 0, order: [['createdAt', 'DESC']] });
    } catch (error) {
      console.error('Error finding all Monnify notifications:', error);
      return [];
    }
  }

  async search(searchOptions: { reference?: string; status?: string; amount?: number }): Promise<MonnifyNotifications[]> {
    const where: any = {};

    if (searchOptions.reference) {
      where.transactionReference = searchOptions.reference;
    }

    if (searchOptions.amount) {
      where.amountPaid = searchOptions.amount;
    }

    try {
      return await this.monnifyNotificationsModel.findAll({ where, order: [['createdAt', 'DESC']] });
    } catch (error) {
      console.error('Error searching Monnify notifications:', error);
      return [];
    }
  }
}
