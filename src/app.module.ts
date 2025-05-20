import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StationsModule } from './modules/stations/stations.module';
import { AttendantsModule } from './modules/attendants/attendants.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        // You might want to adjust DB_PORT default for MySQL here,
        // but it will be overridden by your .env anyway.
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306), // Changed default to 3306 for MySQL
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('3600s'),
        SSL_MODE: Joi.string()
          .valid('require', 'allow', 'prefer', 'disable')
          .default('disable'), // Added SSL_MODE validation for clarity
      }),
      validationOptions: {
        abortEarly: true,
      },
      isGlobal: true, // This was missing in your original snippet within ConfigModule.forRoot, usually good to have.
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        // You'll need to update your entities and migrations paths if they are
        // not relative to the 'dist' folder after build.
        // '__dirname' here will be the directory of the compiled JS file (e.g., 'dist/src')

        // IMPORTANT: TypeORM requires the 'mysql2' package for MySQL, not 'pg'.
        // Ensure you've run 'npm install mysql2' (or 'yarn add mysql2')
        return {
          type: 'mysql', // <--- THIS IS THE PRIMARY CHANGE: from 'postgres' to 'mysql'
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'], // Paths should be fine after build
          synchronize: config.get('NODE_ENV') === 'development', // Use with caution in production!
          logging: config.get('NODE_ENV') === 'development',

          migrations: [__dirname + '/migrations/**/*{.ts,.js}'], // Paths should be fine after build

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
  ],
})
export class AppModule {}
