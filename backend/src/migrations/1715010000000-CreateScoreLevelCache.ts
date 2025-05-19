import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateScoreLevelCache1715010000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS score_level_by_subject (
                subjectId INT NOT NULL,
                subjectName VARCHAR(255) NOT NULL,
                subjectCode VARCHAR(255) NOT NULL,
                excellent INT DEFAULT 0,
                good INT DEFAULT 0,
                average INT DEFAULT 0,
                poor INT DEFAULT 0,
                total INT DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (subjectId),
                CONSTRAINT fk_score_level_subject
                    FOREIGN KEY (subjectId)
                    REFERENCES subjects(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS score_level_by_subject`);
    }
} 