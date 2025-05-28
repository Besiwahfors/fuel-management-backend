import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StationsModule } from './modules/stations/stations.module';
import { AttendantsModule } from './modules/attendants/attendants.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { SettingsModule } from './modules/settings/settings.module'; // <--- ADD THIS IMPORT
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('3600s'),
        SSL_MODE: Joi.string()
          .valid('require', 'allow', 'prefer', 'disable')
          .default('disable'),
      }),
      validationOptions: {
        abortEarly: true,
      },
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          // This line: `__dirname + '/**/*.entity{.ts,.js}'`
          // is crucial as it should automatically pick up your new Setting entity
          // within `src/modules/settings/entities/setting.entity.ts`.
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.get('NODE_ENV') === 'development',
          logging: config.get('NODE_ENV') === 'development',
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          ssl: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    StationsModule,
    AttendantsModule,
    TransactionsModule,
    SettingsModule,
  ],
})
export class AppModule {}
