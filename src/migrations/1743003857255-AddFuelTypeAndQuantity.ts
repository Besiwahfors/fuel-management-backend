import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFuelTypeAndQuantity1743003857255 implements MigrationInterface {
    name = 'AddFuelTypeAndQuantity1743003857255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'manager')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'manager', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_paymentmethod_enum" AS ENUM('cash', 'momo')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_fueltype_enum" AS ENUM('petrol', 'diesel', 'premium', 'electric')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "quantity" numeric(10,2) NOT NULL, "paymentMethod" "public"."transaction_paymentmethod_enum" NOT NULL, "fuelType" "public"."transaction_fueltype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "stationId" integer, "attendantId" integer, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendant" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "stationId" integer, CONSTRAINT "UQ_5650b63eb1b32419e44cb74526e" UNIQUE ("code"), CONSTRAINT "PK_0f816ac9013a3351bfb034bdc2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "station" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "location" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0c4cf3382f77cddaf304687e95c" UNIQUE ("name"), CONSTRAINT "PK_cad1b3e7182ef8df1057b82f6aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_a281f02e8cfac452318e861982f" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_bf805ced7af2f981b8ae13c6cec" FOREIGN KEY ("attendantId") REFERENCES "attendant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendant" ADD CONSTRAINT "FK_bea2d4a31c293c2903cf88fee48" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendant" DROP CONSTRAINT "FK_bea2d4a31c293c2903cf88fee48"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_bf805ced7af2f981b8ae13c6cec"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_a281f02e8cfac452318e861982f"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`DROP TABLE "station"`);
        await queryRunner.query(`DROP TABLE "attendant"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_fueltype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_paymentmethod_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
