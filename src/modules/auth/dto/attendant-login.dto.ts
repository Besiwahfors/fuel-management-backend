import { IsNotEmpty, IsString } from 'class-validator';

export class AttendantLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
