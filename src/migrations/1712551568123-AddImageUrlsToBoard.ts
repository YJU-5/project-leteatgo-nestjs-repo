import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageUrlsToBoard1712551568123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add imageUrls column
    await queryRunner.query(`ALTER TABLE "board" ADD "imageUrls" text`);

    // Migrate data from pictureUrl to imageUrls
    await queryRunner.query(`
      UPDATE "board"
      SET "imageUrls" = ARRAY[picture_url]::text[]
      WHERE picture_url IS NOT NULL
    `);

    // Drop pictureUrl column
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "picture_url"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back pictureUrl column
    await queryRunner.query(
      `ALTER TABLE "board" ADD "picture_url" character varying(255)`,
    );

    // Migrate data back from imageUrls to pictureUrl
    await queryRunner.query(`
      UPDATE "board"
      SET "picture_url" = (imageUrls)[1]
      WHERE "imageUrls" IS NOT NULL AND array_length(imageUrls, 1) > 0
    `);

    // Drop imageUrls column
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "imageUrls"`);
  }
}
