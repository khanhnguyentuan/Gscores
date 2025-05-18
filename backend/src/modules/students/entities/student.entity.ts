import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Score } from '../../scores/entities/score.entity';

@Entity('students')
export class Student {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'student_code', unique: true, nullable: false })
  studentCode: string;

  @Column({ name: 'name', nullable: true })
  name: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ name: 'class_id', nullable: true })
  classId: string;
  
  @Column({ nullable: true })
  foreignLanguageCode: string;

  @OneToMany(() => Score, score => score.student)
  scores: Score[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 