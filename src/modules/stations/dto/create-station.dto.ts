import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 100)
  location: string;
}
