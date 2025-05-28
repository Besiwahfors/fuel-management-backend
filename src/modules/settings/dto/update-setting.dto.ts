// src/modules/settings/dto/update-setting.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string; // The specific setting key to update

  @IsString()
  @IsNotEmpty()
  value: string; // The new value for that setting
}

// Optional: If you want to update the entire theme object at once
// You could define a DTO like this and pass the whole JSON string
// import { IsString, IsOptional } from 'class-validator';
// export class UpdateThemeDto {
//   @IsString()
//   @IsOptional()
//   primaryColor?: string;
//
//   @IsString()
//   @IsOptional()
//   logoUrl?: string;
//
//   // Add all other theme properties that can be updated
// }
