/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PaystackNotifications } from '../models/paystack-notification.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { MailService } from '../../email/email.service';
import { UserService } from 'src/user/services/user.service';
import { WalletService } from 'src/wallet/services/wallet.service';

@Injectable()
export class PaystackNotificationService {
  constructor(
    @InjectModel(PaystackNotifications)
    private readonly paystackNotificationsModel: typeof PaystackNotifications,
    private readonly emailService: MailService,
    private readonly userService: UserService, // Assuming UserService is properly imported
    private readonly walletService: WalletService,
  ) {}

  async savePaystackNotification(data: any) {
    try {
      const { event, data: notificationData } = data;

      if (!event || !notificationData) {
        throw new Error('Invalid Paystack notification data');
      }

      if (event === 'transfer.success' || event === 'charge.success') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const newNotification = await this.paystackNotificationsModel.create({
          event,
          ...(event === 'transfer.success'
            ? this.extractTransferData(notificationData)
            : this.extractChargeData(notificationData)),
        });
        // Attempt to map notification to a wallet transaction (by reference) and update it
        try {
          const reference = newNotification.reference ?? notificationData.reference ?? null;
          if (reference) {
            const txn = await this.walletService.findTransactionByReference(String(reference));
            if (txn) {
              const incomingStatus = (newNotification.status ?? '').toString().toLowerCase();
              const mappedStatus = incomingStatus === 'success' || incomingStatus === 'successful' ? 'SUCCESS' : incomingStatus === 'failed' ? 'FAILED' : incomingStatus.toUpperCase() || 'PENDING';

              const updatedTxn = await this.walletService.updateTransactionStatus(txn.id, mappedStatus);

              // Try to notify the wallet owner via email
              try {
                const wallet = await this.walletService.findWalletById(String(updatedTxn.walletId));
                if (wallet && wallet.userId) {
                  try {
                    const user = await this.userService.findOneById(String(wallet.userId));
                    const to = user.email;
                    const subject = `Payment update: ${mappedStatus}`;
                    const text = `Hi ${user.username || ''},\n\nYour wallet transaction (${updatedTxn.id}) has been updated to status ${mappedStatus}. Amount: ${updatedTxn.amount}.\n\nThanks.`;
                    const html = `<p>Hi ${user.username || ''},</p><p>Your wallet transaction <strong>${updatedTxn.id}</strong> has been updated to status <strong>${mappedStatus}</strong>.</p><p>Amount: ${updatedTxn.amount}</p><p>Thanks.</p>`;

                    await this.emailService.sendEmail({ to, subject, text, html });
                  } catch (emailErr) {
                    console.error('Failed to send payment notification email:', emailErr);
                  }
                }
              } catch (err) {
                console.error('Error fetching wallet/user for notification:', err);
              }
            }
          }
        } catch (err) {
          console.error('Error updating wallet transaction for Paystack notification:', err);
        }

        return newNotification;
      }
    } catch (error) {
      console.error(
        'Error saving Paystack notification:',
        JSON.stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );

      throw error;
    }
  }

  /**
   * Finds a Paystack notification by its ID.
   * @param id The ID of the notification to find.
   * @returns The PaystackNotifications instance if found, otherwise null.
   */
  async findById(id: string): Promise<PaystackNotifications | null> {
    try {
      return await this.paystackNotificationsModel.findByPk(id);
    } catch (error) {
      console.error('Error finding Paystack notification by ID:', error);
      return null; // Or throw a custom error for specific handling
    }
  }

  /**
   * Finds all Paystack notifications.
   * @param options Optional search options (e.g., limit, offset, where).
   * @returns An array of PaystackNotifications instances.
   */
  async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<PaystackNotifications[]> {
    try {
      return await this.paystackNotificationsModel.findAll({
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      console.error('Error finding all Paystack notifications:', error);
      return []; // Or throw a custom error for specific handling
    }
  }

  /**
   * Searches for Paystack notifications based on the provided criteria.
   * @param searchOptions Search criteria (e.g., reference, status, amount).
   * @returns An array of PaystackNotifications instances.
   */
  async search(searchOptions: {
    reference?: string;
    status?: string;
    amount?: number;
  }): Promise<PaystackNotifications[]> {
    const where: any = {};

    if (searchOptions.reference) {
      where.reference = { [Op.iLike]: `%${searchOptions.reference}%` };
    }

    if (searchOptions.status) {
      where.status = searchOptions.status;
    }

    if (searchOptions.amount) {
      where.amount = searchOptions.amount;
    }

    try {
      return await this.paystackNotificationsModel.findAll({
        where,
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      console.error('Error searching for Paystack notifications:', error);
      return []; // Or throw a custom error for specific handling
    }
  }

  private extractTransferData(data: any) {
    const { amount, currency, reference, status, recipient, ...otherData } =
      data;

    return {
      paystackId: data.id,
      amount,
      currency,
      reference,
      status,
      domain: recipient.domain,
      customer: recipient,
      authorization: otherData,
      ...otherData,
    };
  }

  // Function to extract data for charge.success events
  private extractChargeData(data: any) {
    const {
      id,
      amount,
      currency,
      reference,
      status,
      paidAt,
      channel,
      ipAddress,
      customer,
      authorization,
      ...otherData
    } = data;

    return {
      paystackId: id,
      amount,
      currency,
      reference,
      status,
      paidAt,
      channel,
      ipAddress,
      customer,
      authorization,
      ...otherData,
    };
  }
}
