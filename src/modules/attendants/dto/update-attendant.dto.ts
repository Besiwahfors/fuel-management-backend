import { PartialType } from '@nestjs/swagger';
import { CreateAttendantDto } from './create-attendant.dto';
import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAttendantDto extends PartialType(CreateAttendantDto) {
  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  refreshTokenExpiresAt?: Date | null;
}
