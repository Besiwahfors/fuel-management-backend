import { IsEnum, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';
import { PaymentMethod, FuelType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

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
}
