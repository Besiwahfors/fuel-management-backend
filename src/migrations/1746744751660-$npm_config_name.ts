import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1746744751660 implements MigrationInterface {
  name = ' $npmConfigName1746744751660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'completed'`,
    );

    // Rename the old enum type (optional, for cleanliness)
    await queryRunner.query(`
            ALTER TYPE "public"."transaction_fueltype_enum" RENAME TO "transaction_fueltype_enum_old";
        `);

    // Create the new lowercase enum type
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_fueltype_enum" AS ENUM('petrol', 'diesel', 'premium', 'electric')`,
    );

    // Change the column type to the new lowercase enum
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "fuelType" TYPE "public"."transaction_fueltype_enum"
            USING "fuelType"::"text"::"public"."transaction_fueltype_enum";
        `);

    // Drop the old enum type (optional)
    await queryRunner.query(`
            DROP TYPE "public"."transaction_fueltype_enum_old";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_fueltype_enum_old" AS ENUM('petrol', 'diesel', 'premium', 'electric')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ALTER COLUMN "fuelType" TYPE "public"."transaction_fueltype_enum_old" USING "fuelType"::"text"::"public"."transaction_fueltype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."transaction_fueltype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_fueltype_enum_old" RENAME TO "transaction_fueltype_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
  }
}
