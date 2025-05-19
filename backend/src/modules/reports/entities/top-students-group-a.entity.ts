import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('top_students_group_a')
export class TopStudentsGroupA {
  @PrimaryColumn()
  rank: number;

  @Column()
  studentId: string;

  @Column()
  studentName: string;

  @Column()
  studentCode: string;

  @Column('decimal', { precision: 6, scale: 2 })
  toan: number;

  @Column('decimal', { precision: 6, scale: 2 })
  vat_li: number;

  @Column('decimal', { precision: 6, scale: 2 })
  hoa_hoc: number;

  @Column('decimal', { precision: 6, scale: 2 })
  total: number;

  @Column('decimal', { precision: 6, scale: 2 })
  average: number;

  @CreateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;
} 