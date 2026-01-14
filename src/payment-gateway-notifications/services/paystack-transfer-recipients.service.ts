/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PaystackTransferRecipients } from '../models/paystack-transfer-recipients';
import { CreatePaystackRecipientDto } from '../dto/CreatePaystackRecipient.dto';
import { PaystackRecipientResponseDto } from '../dto/PaystackRecipientResponse.dto';

@Injectable()
export class PaystackTransferRecipientService {
  private readonly logger = new Logger(PaystackTransferRecipientService.name);
  private readonly PAYSTACK_API_BASE_URL: string;
  private readonly PAYSTACK_SECRET_KEY: string;

  constructor(
    @InjectModel(PaystackTransferRecipients)
    private readonly paystackTransferRecipientModel: typeof PaystackTransferRecipients,
    private readonly configService: ConfigService,
  ) {
    this.PAYSTACK_API_BASE_URL =
      process.env.PAYSTACK_API_BASE_URL ||
      this.configService.get<string>('PAYSTACK_API_BASE_URL') ||
      'https://api.paystack.co';
    this.PAYSTACK_SECRET_KEY =
      process.env.PAYSTACK_SECRET_KEY ||
      this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!this.PAYSTACK_SECRET_KEY) {
      this.logger.error(
        'PAYSTACK_SECRET_KEY is not set in environment variables.',
      );
      throw new Error('Paystack secret key is not configured.');
    }
  }

  /**
   * Creates a transfer recipient on Paystack and stores the details in the database.
   * @param createRecipientDto The DTO containing recipient details.
   * @returns The created PaystackTransferRecipients database record.
   */
  async createTransferRecipient(
    createRecipientDto: CreatePaystackRecipientDto,
  ): Promise<PaystackTransferRecipients> {
    this.logger.log(
      `Attempting to create transfer recipient for: ${createRecipientDto.name}`,
    );

    try {
      const paystackResponse = await this.callPaystackCreateRecipientApi(
        createRecipientDto,
      ).catch((error) => {
        this.logger.error(
          `Error calling Paystack API: ${error.message}`,
          error.stack,
        );
        throw error;
      });

      if (!paystackResponse.status) {
        throw new BadRequestException(
          `Paystack API error: ${paystackResponse.message}`,
        );
      }

      const paystackData = paystackResponse.data;

      // Save to database
      const newRecipient = await this.paystackTransferRecipientModel
        .create({
          paystackId: paystackData.id,
          bankDetailId: createRecipientDto.bankDetailId, // Map bankDetailId from DTO
          paystackName: paystackData.name,
          paystackDomain: paystackData.domain,
          paystackCurrency: paystackData.currency,
          paystackIntegration: paystackData.integration?.toString(), // Convert number to string if needed
          paystackType: paystackData.type,
          paystackRecipientCode: paystackData.recipient_code,
          paystackDetail: JSON.stringify(paystackData.details), // Store details as JSON string
          paystackIsDeleted: paystackData.is_deleted ? 'true' : 'false',
          paystackIsActive: paystackData.active ? 'true' : 'false',
          paystackCreatedAt: new Date(paystackData.createdAt),
        })
        .catch((error) => {
          this.logger.error(
            `Error saving recipient to database: ${error.message}`,
            error.stack,
          );
          throw error;
        });

      this.logger.log(
        `Successfully created transfer recipient for ${createRecipientDto.name} with Paystack ID: ${paystackData.id}`,
      );
      return newRecipient;
    } catch (error) {
      this.logger.error(
        `Failed to create transfer recipient: ${error.message}`,
        error.stack,
      );
      if (axios.isAxiosError(error) && error.response) {
        throw new InternalServerErrorException(
          `Paystack API responded with an error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating transfer recipient.',
      );
    }
  }

  /**
   * Calls the Paystack API to create a new transfer recipient.
   * @param dto The DTO containing recipient details.
   * @returns The response from the Paystack API.
   */
  private async callPaystackCreateRecipientApi(
    dto: CreatePaystackRecipientDto,
  ): Promise<PaystackRecipientResponseDto> {
    const url = `${this.PAYSTACK_API_BASE_URL}/transferrecipient`;
    const headers = {
      Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
    const data = {
      type: dto.type,
      name: dto.name,
      account_number: dto.account_number,
      bank_code: dto.bank_code,
      currency: dto.currency,
    };

    this.logger.debug(
      `Calling Paystack API: ${url} with data: ${JSON.stringify(data)}`,
    );

    const response = await axios.post<PaystackRecipientResponseDto>(url, data, {
      headers,
    });
    return response.data;
  }

  /**
   * Finds a transfer recipient by their Paystack recipient code.
   * @param recipientCode The Paystack recipient code.
   * @returns The PaystackTransferRecipients database record, or null if not found.
   */
  async findRecipientByPaystackCode(
    recipientCode: string,
  ): Promise<PaystackTransferRecipients | null> {
    return this.paystackTransferRecipientModel.findOne({
      where: { paystackRecipientCode: recipientCode },
    });
  }

  /**
   * Finds a transfer recipient by their internal database ID.
   * @param id The internal UUID of the recipient.
   * @returns The PaystackTransferRecipients database record, or null if not found.
   */
  async findRecipientById(
    id: string,
  ): Promise<PaystackTransferRecipients | null> {
    return this.paystackTransferRecipientModel.findByPk(id);
  }
}
