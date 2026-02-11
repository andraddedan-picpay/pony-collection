import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1770840452553 implements MigrationInterface {
    name = 'Schema1770840452553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "ponies" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "isFavorite" boolean NOT NULL, "element" varchar NOT NULL, "personality" varchar NOT NULL, "talent" varchar NOT NULL, "summary" text NOT NULL, "imageUrl" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ponies"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
