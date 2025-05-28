// src/modules/settings/settings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Setting } from './entities/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])], // Register the Setting entity with TypeORM
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService], // Export SettingsService if other modules need to use it
})
export class SettingsModule {}
