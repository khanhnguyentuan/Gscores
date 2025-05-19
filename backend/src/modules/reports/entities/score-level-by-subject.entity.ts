import { Entity, Column, PrimaryColumn, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('score_level_by_subject')
export class ScoreLevelBySubject {
  @PrimaryColumn()
  subjectId: number;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  subjectName: string;

  @Column()
  subjectCode: string;

  @Column({ type: 'int', default: 0 })
  excellent: number;

  @Column({ type: 'int', default: 0 })
  good: number;

  @Column({ type: 'int', default: 0 })
  average: number;

  @Column({ type: 'int', default: 0 })
  poor: number;

  @Column({ type: 'int', default: 0 })
  total: number;

  @CreateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;
} 