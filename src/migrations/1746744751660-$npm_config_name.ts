import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1746744751660 implements MigrationInterface {
  name = '$npmConfigName1746744751660'; // Keep this name as is from your file

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Original PostgreSQL: CREATE TYPE "public"."transaction_status_enum" AS ENUM('completed', 'failed')
    // MariaDB/MySQL equivalent is handled directly in the ALTER TABLE statement
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD \`status\` ENUM('completed', 'failed') NOT NULL DEFAULT 'completed'`,
    );

    // The following blocks of code were for renaming/changing enum types in PostgreSQL.
    // In MariaDB/MySQL, ENUMs are tied directly to the column definition.
    // If you need to change the values of an ENUM in MariaDB, it typically
    // involves dropping and re-adding the column, or using ALTER TABLE MODIFY COLUMN.
    // Since your previous migration already created 'fuelType' with correct ENUM,
    // these steps are redundant and problematic for MariaDB.
    // We are commenting them out.

    // Original PostgreSQL: ALTER TYPE "public"."transaction_fueltype_enum" RENAME TO "transaction_fueltype_enum_old";
    // await queryRunner.query(`
    //     ALTER TYPE "public"."transaction_fueltype_enum" RENAME TO "transaction_fueltype_enum_old";
    // `);

    // Original PostgreSQL: CREATE TYPE "public"."transaction_fueltype_enum" AS ENUM('petrol', 'diesel', 'premium', 'electric');
    // await queryRunner.query(
    //   `CREATE TYPE "public"."transaction_fueltype_enum" AS ENUM('petrol', 'diesel', 'premium', 'electric')`,
    // );

    // Original PostgreSQL: ALTER COLUMN "fuelType" TYPE "public"."transaction_fueltype_enum" USING "fuelType"::"text"::"public"."transaction_fueltype_enum";
    // await queryRunner.query(`
    //     ALTER TABLE "transaction"
    //     ALTER COLUMN "fuelType" TYPE "public"."transaction_fueltype_enum"
    //     USING "fuelType"::"text"::"public"."transaction_fueltype_enum";
    // `);

    // Original PostgreSQL: DROP TYPE "public"."transaction_fueltype_enum_old";
    // await queryRunner.query(`
    //     DROP TYPE "public"."transaction_fueltype_enum_old";
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Original PostgreSQL down actions for transaction_fueltype_enum and transaction_status_enum
    // These are commented out as they relate to PostgreSQL-specific enum type handling.

    // Original PostgreSQL: CREATE TYPE "public"."transaction_fueltype_enum_old" AS ENUM('petrol', 'diesel', 'premium', 'electric')
    // await queryRunner.query(
    //   `CREATE TYPE "public"."transaction_fueltype_enum_old" AS ENUM('petrol', 'diesel', 'premium', 'electric')`,
    // );
    // Original PostgreSQL: ALTER TABLE "transaction" ALTER COLUMN "fuelType" TYPE "public"."transaction_fueltype_enum_old" USING "fuelType"::"text"::"public"."transaction_fueltype_enum_old"
    // await queryRunner.query(
    //   `ALTER TABLE "transaction" ALTER COLUMN "fuelType" TYPE "public"."transaction_fueltype_enum_old" USING "fuelType"::"text"::"public"."transaction_fueltype_enum_old"`,
    // );
    // Original PostgreSQL: DROP TYPE "public"."transaction_fueltype_enum"
    // await queryRunner.query(`DROP TYPE "public"."transaction_fueltype_enum"`);
    // Original PostgreSQL: ALTER TYPE "public"."transaction_fueltype_enum_old" RENAME TO "transaction_fueltype_enum"
    // await queryRunner.query(
    //   `ALTER TYPE "public"."transaction_fueltype_enum_old" RENAME TO "transaction_fueltype_enum"`,
    // );

    // Corrected SQL for MariaDB/MySQL to drop the 'status' column
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP COLUMN \`status\``,
    );
    // Original PostgreSQL: DROP TYPE "public"."transaction_status_enum" - not needed for MariaDB
    // await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
  }
}
