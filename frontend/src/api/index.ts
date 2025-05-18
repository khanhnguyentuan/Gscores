import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

// Sử dụng API_BASE_URL từ utils/api thay vì hardcode URL
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface cho cấu trúc dữ liệu scores trả về từ API
interface ApiScoreItem {
  subject: string;
  subjectCode: string;
  score: string;
}

// Students API
export const getStudentByRegistrationNumber = async (registrationNumber: string) => {
  try {
    const response = await api.get(`/students/${registrationNumber}`);
    return {
      id: response.data.studentCode,
      name: response.data.name,
      code: response.data.studentCode,
      class: response.data.classId,
      foreignLanguageCode: response.data.foreignLanguageCode
    };
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
};

export const getStudentScores = async (registrationNumber: string) => {
  try {
    const response = await api.get(`/students/${registrationNumber}/scores`);
    
    // API trả về cấu trúc { student: {...}, scores: [...] }
    if (response.data && Array.isArray(response.data.scores)) {
      // Chuyển đổi cấu trúc điểm số để phù hợp với interface Score
      return response.data.scores.map((item: ApiScoreItem, index: number) => {
        // Chuyển điểm 9.99 thành 10
        const scoreValue = parseFloat(item.score);
        const normalizedScore = scoreValue === 9.99 ? 10 : scoreValue;
        
        return {
          id: index + 1, // Tạo ID dựa trên vị trí
          value: normalizedScore, // Điểm đã được chuẩn hóa
          student_id: registrationNumber,
          subject_id: index + 1, // Tạo subject_id tạm thời
          subject_name: item.subject,
          subject_code: item.subjectCode
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching student scores:', error);
    throw error;
  }
};

// Reports API
export const getTopStudentsGroupA = async (limit = 10, offset = 0) => {
  try {
    const response = await api.get(`/reports/top-students-group-a?limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top students:', error);
    throw error;
  }
};

export const getScoreLevelsBySubject = async () => {
  try {
    const response = await api.get('/reports/score-levels-by-subject');
    return response.data;
  } catch (error) {
    console.error('Error fetching score levels by subject:', error);
    throw error;
  }
};

export default api; 