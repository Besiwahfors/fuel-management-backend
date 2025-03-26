import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';

export class CreateAttendantDto {
  @IsString()
  name: string;
  code: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  stationId?: number;
}
