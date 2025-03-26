import { IsEnum, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsNumber()
  stationId: number;

  @IsNotEmpty()
  @IsNumber()
  attendantId: number;
}
