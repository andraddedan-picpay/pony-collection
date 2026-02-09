import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1770669451999 implements MigrationInterface {
  name = 'InitialSchema1770669451999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ponies" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "element" varchar NOT NULL, "personality" varchar NOT NULL, "talent" varchar NOT NULL, "summary" text NOT NULL, "imageUrl" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "favorites" ("id" varchar PRIMARY KEY NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "ponyId" varchar)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_favorites" ("id" varchar PRIMARY KEY NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "ponyId" varchar, CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_7a1c7c6ac228dfa0b105088fcbf" FOREIGN KEY ("ponyId") REFERENCES "ponies" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_favorites"("id", "createdAt", "userId", "ponyId") SELECT "id", "createdAt", "userId", "ponyId" FROM "favorites"`,
    );
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_favorites" RENAME TO "favorites"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorites" RENAME TO "temporary_favorites"`,
    );
    await queryRunner.query(
      `CREATE TABLE "favorites" ("id" varchar PRIMARY KEY NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "ponyId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "favorites"("id", "createdAt", "userId", "ponyId") SELECT "id", "createdAt", "userId", "ponyId" FROM "temporary_favorites"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_favorites"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "ponies"`);
  }
}
