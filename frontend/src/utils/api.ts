// Lấy API URL từ biến môi trường hoặc sử dụng fallback
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Xử lý các endpoints khác nếu cần
export const ENDPOINTS = {
  STUDENTS: '/students',
  REPORTS: '/reports',
  SUBJECTS: '/subjects',
  SCORES: '/scores',
}; 