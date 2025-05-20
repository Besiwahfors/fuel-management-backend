import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFuelTypeAndQuantity1743003857255 implements MigrationInterface {
  name = 'AddFuelTypeAndQuantity1743003857255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Corrected SQL for MariaDB/MySQL for 'user' table
    await queryRunner.query(
      `CREATE TABLE \`user\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`email\` VARCHAR(255) NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'manager') NOT NULL DEFAULT 'manager',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`UQ_e12875dfb3b1d92d7d7c5377e22\` UNIQUE (\`email\`),
        CONSTRAINT \`PK_cace4a159ff9f2512dd42373760\` PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    // Corrected SQL for MariaDB/MySQL for 'transaction' table
    await queryRunner.query(
      `CREATE TABLE \`transaction\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`amount\` DECIMAL(10,2) NOT NULL,
        \`quantity\` DECIMAL(10,2) NOT NULL,
        \`paymentMethod\` ENUM('cash', 'momo') NOT NULL,
        \`fuelType\` ENUM('petrol', 'diesel', 'premium', 'electric') NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`userId\` INT,
        \`stationId\` INT,
        \`attendantId\` INT,
        CONSTRAINT \`PK_89eadb93a89810556e1cbcd6ab9\` PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    // Corrected SQL for MariaDB/MySQL for 'attendant' table
    await queryRunner.query(
      `CREATE TABLE \`attendant\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`code\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`stationId\` INT,
        CONSTRAINT \`UQ_5650b63eb1b32419e44cb74526e\` UNIQUE (\`code\`),
        CONSTRAINT \`PK_0f816ac9013a3351bfb034bdc2a\` PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    // Corrected SQL for MariaDB/MySQL for 'station' table
    await queryRunner.query(
      `CREATE TABLE \`station\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`location\` VARCHAR(255) NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`UQ_0c4cf3382f77cddaf304687e95c\` UNIQUE (\`name\`),
        CONSTRAINT \`PK_cad1b3e7182ef8df1057b82f6aa\` PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    // Corrected SQL for MariaDB/MySQL for ALTER TABLE statements (foreign keys)
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_605baeb040ff0fae995404cea37\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_a281f02e8cfac452318e861982f\` FOREIGN KEY (\`stationId\`) REFERENCES \`station\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_bf805ced7af2f981b8ae13c6cec\` FOREIGN KEY (\`attendantId\`) REFERENCES \`attendant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`attendant\` ADD CONSTRAINT \`FK_bea2d4a31c293c2903cf88fee48\` FOREIGN KEY (\`stationId\`) REFERENCES \`station\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Corrected SQL for MariaDB/MySQL for DROP CONSTRAINT statements
    await queryRunner.query(
      `ALTER TABLE \`attendant\` DROP CONSTRAINT \`FK_bea2d4a31c293c2903cf88fee48\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP CONSTRAINT \`FK_bf805ced7af2f981b8ae13c6cec\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP CONSTRAINT \`FK_a281f02e8cfac452318e861982f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP CONSTRAINT \`FK_605baeb040ff0fae995404cea37\``,
    );

    // Corrected SQL for MariaDB/MySQL for DROP TABLE statements
    await queryRunner.query(`DROP TABLE \`station\``);
    await queryRunner.query(`DROP TABLE \`attendant\``);
    await queryRunner.query(`DROP TABLE \`transaction\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    // REMOVED: PostgreSQL-specific DROP TYPE statements are no longer needed
  }
}
