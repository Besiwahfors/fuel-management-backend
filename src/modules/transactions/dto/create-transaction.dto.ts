// src\modules\transactions\dto\create-transaction.dto.ts
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { PaymentMethod, FuelType } from '../entities/transaction.entity';
import { TransactionStatus } from '../entities/transaction.entity'; // Import TransactionStatus

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  liters: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsNotEmpty()
  @IsNumber()
  stationId: number;

  @IsNotEmpty()
  @IsNumber()
  attendantId: number;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
