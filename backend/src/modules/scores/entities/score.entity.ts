import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, student => student.scores)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Subject, subject => subject.scores)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 