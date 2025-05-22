// src\modules\stations\dto\create-station.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { StationStatus } from '../entities/station.entity'; // Import the enum

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional() // Make status optional for creation, using default in entity
  @IsEnum(StationStatus)
  status?: StationStatus; // Make it optional and use the enum
}
