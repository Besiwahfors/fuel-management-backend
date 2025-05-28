// src/modules/settings/settings.controller.ts
import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Existing methods (getAllSettings, updateSetting) remain if you want individual setting management.
  // @Get()
  // async getAllSettings() { /* ... */ }
  // @Put()
  // async updateSetting(@Body() updateSettingDto: UpdateSettingDto) { /* ... */ }

  /**
   * Retrieves the entire theme configuration.
   * GET /api/settings/theme
   * Returns the theme object if found, otherwise returns null.
   */
  @Get('theme') // Endpoint for theme retrieval
  async getThemeConfig() {
    // This will now return the parsed theme object or null if not found in DB
    return this.settingsService.getThemeConfig();
  }

  /**
   * Updates the entire theme configuration.
   * PUT /api/settings/theme
   * Body: The full theme configuration object as JSON.
   */
  @Put('theme') // Endpoint for theme update
  async saveThemeConfig(@Body() config: Record<string, any>) {
    return this.settingsService.saveThemeConfig(config);
  }
}
