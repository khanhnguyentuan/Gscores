# Phân tích cấu trúc dữ liệu điểm thi THPT 2024

## Cấu trúc dữ liệu thực tế

Sau khi đọc file `diem_thi_thpt_2024.csv`, chúng ta thấy cấu trúc dữ liệu như sau:

```csv
sbd,toan,ngu_van,ngoai_ngu,vat_li,hoa_hoc,sinh_hoc,lich_su,dia_li,gdcd,ma_ngoai_ngu
01000001,8.4,6.75,8.0,6.0,5.25,5.0,,,,N1
01000002,8.6,8.5,7.2,,,,7.25,6.0,8.0,N1
01000003,8.2,8.75,8.2,,,,7.25,7.25,8.75,N1
```

Trong đó:
- **sbd**: Số báo danh (mã định danh duy nhất của thí sinh)
- **Các môn thi**: Điểm theo thang 10 (có thể để trống nếu thí sinh không thi môn đó)
  - **toan**: Toán
  - **ngu_van**: Ngữ văn
  - **ngoai_ngu**: Ngoại ngữ
  - **vat_li**: Vật lý
  - **hoa_hoc**: Hóa học
  - **sinh_hoc**: Sinh học
  - **lich_su**: Lịch sử
  - **dia_li**: Địa lý
  - **gdcd**: Giáo dục công dân
- **ma_ngoai_ngu**: Mã môn ngoại ngữ (N1 - tiếng Anh, N2 - tiếng Nga, v.v.)

Nhận xét: File CSV thực tế không chứa thông tin họ tên, ngày sinh, giới tính và nơi sinh của thí sinh, chỉ có số báo danh và điểm các môn.

## Phân tích và thiết kế cơ sở dữ liệu

Dựa trên cấu trúc dữ liệu thực tế, chúng ta có thể thiết kế cơ sở dữ liệu với các bảng sau:

### 1. Bảng `students`

```typescript
// Entity Student
@Entity()
export class Student {
  @PrimaryColumn()
  id: string; // Số báo danh

  @Column({ nullable: true })
  foreignLanguageCode: string; // Mã ngoại ngữ

  @OneToMany(() => Score, (score) => score.student)
  scores: Score[];
}
```

### 2. Bảng `subjects`

```typescript
// Entity Subject
@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Ví dụ: 'toan', 'ngu_van', etc.

  @Column()
  name: string; // Ví dụ: 'Toán', 'Ngữ văn', etc.

  @OneToMany(() => Score, (score) => score.subject)
  scores: Score[];
}
```

### 3. Bảng `scores`

```typescript
// Entity Score
@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.scores)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Subject, (subject) => subject.scores)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  score: number;
}
```

## Quá trình import dữ liệu

1. **Đọc file CSV** sử dụng thư viện csv-parser
2. **Tạo dữ liệu môn học** trong bảng subjects
3. **Import thông tin học sinh** vào bảng students
4. **Import điểm thi** vào bảng scores

## Ví dụ code import dữ liệu

```typescript
// Trong file service ImportService

import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { Subject } from './entities/subject.entity';
import { Score } from './entities/score.entity';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
  ) {}

  async importFromCSV(filePath: string): Promise<void> {
    // Tạo subjects trước
    const subjects = [
      { code: 'toan', name: 'Toán' },
      { code: 'ngu_van', name: 'Ngữ văn' },
      { code: 'ngoai_ngu', name: 'Ngoại ngữ' },
      { code: 'vat_li', name: 'Vật lý' },
      { code: 'hoa_hoc', name: 'Hóa học' },
      { code: 'sinh_hoc', name: 'Sinh học' },
      { code: 'lich_su', name: 'Lịch sử' },
      { code: 'dia_li', name: 'Địa lý' },
      { code: 'gdcd', name: 'Giáo dục công dân' },
    ];

    // Lưu subjects vào database
    for (const subject of subjects) {
      const existingSubject = await this.subjectRepository.findOne({
        where: { code: subject.code },
      });
      if (!existingSubject) {
        await this.subjectRepository.save(subject);
      }
    }

    // Lấy tất cả subjects để sử dụng khi import điểm
    const allSubjects = await this.subjectRepository.find();
    const subjectsMap = allSubjects.reduce((map, subject) => {
      map[subject.code] = subject;
      return map;
    }, {});

    // Đọc và import dữ liệu từ CSV
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              // Tạo student
              const student = this.studentRepository.create({
                id: row.sbd,
                foreignLanguageCode: row.ma_ngoai_ngu,
              });

              // Lưu student
              await this.studentRepository.save(student);

              // Import điểm cho từng môn học
              for (const subject of allSubjects) {
                const scoreValue = row[subject.code];
                if (scoreValue !== undefined && scoreValue !== '') {
                  const score = this.scoreRepository.create({
                    student,
                    subject,
                    score: parseFloat(scoreValue),
                  });
                  await this.scoreRepository.save(score);
                }
              }
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });
    });
  }
}
```

## Chức năng phân tích thống kê

Dựa trên cấu trúc dữ liệu này, chúng ta có thể thực hiện các chức năng theo yêu cầu:

### 1. Tìm kiếm điểm theo số báo danh

```typescript
async findByRegistrationNumber(sbd: string): Promise<any> {
  const student = await this.studentRepository.findOne({
    where: { id: sbd },
    relations: ['scores', 'scores.subject'],
  });
  
  if (!student) {
    throw new NotFoundException('Student not found');
  }
  
  // Chuyển đổi dữ liệu thành format dễ đọc
  const scores = {};
  student.scores.forEach((score) => {
    scores[score.subject.code] = score.score;
  });
  
  return {
    sbd: student.id,
    ma_ngoai_ngu: student.foreignLanguageCode,
    ...scores,
  };
}
```

### 2. Thống kê số học sinh theo 4 mức điểm

```typescript
async getScoreStatistics(): Promise<any> {
  const statistics = {};
  
  for (const subject of await this.subjectRepository.find()) {
    const levels = {
      level1: 0, // >= 8
      level2: 0, // >= 6 và < 8
      level3: 0, // >= 4 và < 6
      level4: 0, // < 4
    };
    
    const scores = await this.scoreRepository.find({
      where: { subject: { id: subject.id } },
    });
    
    scores.forEach((score) => {
      if (score.score >= 8) {
        levels.level1++;
      } else if (score.score >= 6) {
        levels.level2++;
      } else if (score.score >= 4) {
        levels.level3++;
      } else {
        levels.level4++;
      }
    });
    
    statistics[subject.code] = levels;
  }
  
  return statistics;
}
```

### 3. Danh sách top 10 học sinh khối A (Toán, Lý, Hóa)

```typescript
async getTop10GroupA(): Promise<any> {
  // Truy vấn database để lấy tất cả học sinh có điểm Toán, Lý, Hóa
  const students = await this.studentRepository.find({
    relations: ['scores', 'scores.subject'],
  });
  
  // Lọc và tính điểm tổng
  const result = students
    .map((student) => {
      const scoreMap = {};
      let hasAllSubjects = true;
      
      student.scores.forEach((score) => {
        scoreMap[score.subject.code] = score.score;
      });
      
      // Kiểm tra học sinh có đủ 3 môn khối A không
      ['toan', 'vat_li', 'hoa_hoc'].forEach((subjectCode) => {
        if (scoreMap[subjectCode] === undefined) {
          hasAllSubjects = false;
        }
      });
      
      if (!hasAllSubjects) {
        return null;
      }
      
      // Tính tổng điểm 3 môn
      const totalScore = 
        parseFloat(scoreMap['toan'] || 0) + 
        parseFloat(scoreMap['vat_li'] || 0) + 
        parseFloat(scoreMap['hoa_hoc'] || 0);
      
      return {
        sbd: student.id,
        toan: scoreMap['toan'],
        vat_li: scoreMap['vat_li'],
        hoa_hoc: scoreMap['hoa_hoc'],
        total: totalScore,
      };
    })
    .filter(Boolean) // Loại bỏ null
    .sort((a, b) => b.total - a.total) // Sắp xếp giảm dần
    .slice(0, 10); // Lấy top 10
  
  return result;
}
``` 