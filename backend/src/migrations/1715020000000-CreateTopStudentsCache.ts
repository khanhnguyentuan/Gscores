import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTopStudentsCache1715020000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS top_students_group_a (
                rank INT NOT NULL,
                studentId VARCHAR(255) NOT NULL,
                studentName VARCHAR(255) NOT NULL,
                studentCode VARCHAR(255) NOT NULL,
                toan DECIMAL(6,2) DEFAULT 0,
                vat_li DECIMAL(6,2) DEFAULT 0,
                hoa_hoc DECIMAL(6,2) DEFAULT 0,
                total DECIMAL(6,2) DEFAULT 0,
                average DECIMAL(6,2) DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (rank)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS top_students_group_a`);
    }
} 