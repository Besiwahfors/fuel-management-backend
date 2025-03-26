import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDto {
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
