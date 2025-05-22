// src/modules/transactions/dto/create-transaction.dto.ts
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
// Now FuelType is correctly imported as an enum (both type and value)
import {
  PaymentMethod,
  FuelType,
  TransactionStatus,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  liters: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(FuelType) // <--- THIS WILL NOW WORK CORRECTLY
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

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
