import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1781679440338 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published', 'archived');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email"     character varying NOT NULL,
        "password"  character varying NOT NULL,
        "name"      character varying,
        "role"      character varying NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"        character varying NOT NULL,
        "slug"        character varying NOT NULL,
        "description" character varying,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"),
        CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"),
        CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tags" (
        "id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"      character varying NOT NULL,
        "slug"      character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"),
        CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"),
        CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id"         uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title"      character varying NOT NULL,
        "slug"       character varying NOT NULL,
        "content"    text NOT NULL,
        "excerpt"    character varying,
        "coverImage" character varying,
        "status"     "public"."posts_status_enum" NOT NULL DEFAULT 'draft',
        "viewCount"  integer NOT NULL DEFAULT 0,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "authorId"   uuid NOT NULL,
        "categoryId" uuid,
        CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"),
        CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts_tags_tags" (
        "postsId" uuid NOT NULL,
        "tagsId"  uuid NOT NULL,
        CONSTRAINT "PK_0102fd077ecbe473388af8f3358" PRIMARY KEY ("postsId", "tagsId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash" character varying NOT NULL,
        "userId"    uuid NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_c25bc63d248ca90e8dcc1d92d0" ON "refresh_tokens" ("tokenHash")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cf364c7e6905b285c4b55a0034" ON "posts_tags_tags" ("postsId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_ce163a967812183a51b044f740" ON "posts_tags_tags" ("tagsId")`);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id");
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "posts" ADD CONSTRAINT "FK_168bf21b341e2ae340748e2541d" FOREIGN KEY ("categoryId") REFERENCES "categories"("id");
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "posts_tags_tags" ADD CONSTRAINT "FK_cf364c7e6905b285c4b55a00343" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON UPDATE CASCADE ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "posts_tags_tags" ADD CONSTRAINT "FK_ce163a967812183a51b044f7404" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON UPDATE CASCADE ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_610102b60fea1455310ccd299de"`);
    await queryRunner.query(`ALTER TABLE "posts_tags_tags" DROP CONSTRAINT IF EXISTS "FK_ce163a967812183a51b044f7404"`);
    await queryRunner.query(`ALTER TABLE "posts_tags_tags" DROP CONSTRAINT IF EXISTS "FK_cf364c7e6905b285c4b55a00343"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "FK_168bf21b341e2ae340748e2541d"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "FK_c5a322ad12a7bf95460c958e80e"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ce163a967812183a51b044f740"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cf364c7e6905b285c4b55a0034"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_c25bc63d248ca90e8dcc1d92d0"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts_tags_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."posts_status_enum"`);
  }
}
