// src/modules/settings/settings.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  // Existing methods (getSetting, getAllSettings, updateSetting) remain as they are
  // if you want flexibility to store individual settings.

  /**
   * Saves the entire theme configuration as a single JSON string under a fixed key.
   * @param config The full theme configuration object.
   * @returns The saved Setting entity.
   */
  async saveThemeConfig(config: Record<string, any>): Promise<Setting> {
    const key = 'adminThemeConfig'; // Use a fixed key for the entire theme object
    const value = JSON.stringify(config); // Convert the object to a JSON string

    let setting = await this.settingsRepository.findOneBy({ key });
    if (!setting) {
      setting = this.settingsRepository.create({ key, value });
    } else {
      setting.value = value; // Update the value
    }
    return this.settingsRepository.save(setting);
  }

  /**
   * Retrieves the entire theme configuration as a parsed JSON object.
   * @returns The parsed theme configuration object, or null if not found.
   */
  async getThemeConfig(): Promise<Record<string, any> | null> {
    const setting = await this.settingsRepository.findOneBy({
      key: 'adminThemeConfig',
    });
    return setting ? JSON.parse(setting.value) : null; // Parse the JSON string back to an object
  }
}
