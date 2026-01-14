import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class CreatePaystackRecipientDto {
  @ApiProperty({
    description:
      'The type of recipient (e.g., "nuban" for Nigerian bank accounts)',
    example: 'nuban',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'The name of the recipient',
    example: 'Tolu Robert',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The account number of the recipient',
    example: '01000000010',
  })
  @IsNumberString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty({
    description: 'The bank code of the recipient (e.g., "058" for GTBank)',
    example: '058',
  })
  @IsString()
  @IsNotEmpty()
  bank_code: string;

  @ApiProperty({
    description: 'The currency of the account (e.g., "NGN")',
    example: 'NGN',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'The ID of the KYC record associated with this recipient',
    example: 12345,
  })
  @IsString()
  @IsNotEmpty()
  bankDetailId: string;
}
