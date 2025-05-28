// src/modules/settings/entities/setting.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings') // Table name in your database will be 'settings'
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  // The key for the setting (e.g., 'primaryColor', 'logoUrl', 'themeConfig')
  @Column({ unique: true })
  key: string;

  // The value of the setting (can be a color hex, a URL, or even a JSON string)
  @Column({ type: 'text' }) // Use 'text' for potentially longer JSON strings
  value: string;
}
