// src\modules\stations\dto\update-station.dto.ts
import { PartialType } from '@nestjs/swagger'; // Assuming you have @nestjs/swagger installed
import { CreateStationDto } from './create-station.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StationStatus } from '../entities/station.entity'; // Import the enum

// If you have @nestjs/swagger:
export class UpdateStationDto extends PartialType(CreateStationDto) {
  // All fields are automatically optional from CreateStationDto
  // If you don't have @nestjs/swagger, define manually:
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus; // Add status as optional here
}

// If you DON'T have @nestjs/swagger installed, use this manual definition:
/*
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { StationStatus } from '../entities/station.entity';

export class UpdateStationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;
}
*/
