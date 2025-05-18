import React, { useState } from 'react';
import { FaSearch, FaUserGraduate, FaLanguage, FaSpinner, FaAward, FaBook, FaGraduationCap, FaClipboardList } from 'react-icons/fa';
import { getStudentByRegistrationNumber, getStudentScores } from '../api';
import { Score, StudentWithScores } from '../types';

const SearchScores: React.FC = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [studentData, setStudentData] = useState<StudentWithScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber) return;

    setLoading(true);
    setError('');
    setStudentData(null);
    setAnimate(false);

    try {
      // Lấy thông tin học sinh
      const student = await getStudentByRegistrationNumber(registrationNumber);
      
      // Lấy thông tin điểm số
      const scores = await getStudentScores(registrationNumber);
      
      // Kết hợp thông tin
      setStudentData({
        ...student,
        scores: Array.isArray(scores) ? scores : []
      });
      
      // Trigger animation
      setTimeout(() => setAnimate(true), 100);
    } catch (err) {
      setError('Không tìm thấy thông tin học sinh với mã số này');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (scores: Score[] | undefined) => {
    if (!scores || !Array.isArray(scores) || scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score.value, 0);
    return sum / scores.length;
  };

  const getGradeLabel = (score: number) => {
    if (score >= 8) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Giỏi' };
    if (score >= 6) return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Khá' };
    if (score >= 4) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Trung bình' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Yếu' };
  };

  // Hàm hiển thị tên ngoại ngữ từ mã 
  // const getLanguageInfo = (code: string | undefined) => {
  //   if (!code) return { name: "Không xác định", icon: "🌐" };
    
  //   const languages: Record<string, { name: string, icon: string }> = {
  //     "N1": { name: "Tiếng Nhật N1", icon: "🇯🇵" },
  //     "N2": { name: "Tiếng Nhật N2", icon: "🇯🇵" },
  //     "N3": { name: "Tiếng Nhật N3", icon: "🇯🇵" },
  //     "N4": { name: "Tiếng Nhật N4", icon: "🇯🇵" },
  //     "N5": { name: "Tiếng Nhật N5", icon: "🇯🇵" },
  //     "ENG": { name: "Tiếng Anh", icon: "🇬🇧" },
  //     "FRA": { name: "Tiếng Pháp", icon: "🇫🇷" },
  //     "RUS": { name: "Tiếng Nga", icon: "🇷🇺" },
  //     "CHN": { name: "Tiếng Trung", icon: "🇨🇳" },
  //     "KOR": { name: "Tiếng Hàn", icon: "🇰🇷" }
  //   };
    
  //   return languages[code] || { name: `Ngoại ngữ ${code}`, icon: "🌐" };
  // };

  return (
    <div className="flex flex-col slide-in">
      <h1 className="text-2xl font-bold mb-6">Tra cứu điểm số</h1>
      
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-primary mb-2">Tra cứu điểm số học sinh</h2>
          <p className="text-gray-600 mb-6">Nhập mã số học sinh để xem thông tin chi tiết và điểm số của học sinh.</p>
          
          {/* Form tìm kiếm */}
          <form onSubmit={handleSearch}>
            <div className="flex rounded-lg overflow-hidden border-2 border-primary/30 focus-within:border-primary/80 transition-colors shadow-md">
              <input
                type="text"
                placeholder="Nhập mã số học sinh..."
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="flex-1 px-4 py-3 focus:outline-none text-primary"
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 flex items-center hover:bg-primary/90 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    {FaSpinner({ className: "animate-spin mr-2" })}
                    <span>Đang tìm...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    {FaSearch({ className: "mr-2" })}
                    <span>Tìm kiếm</span>
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Ví dụ: HS001, HS002, HS003...</p>
          </form>
        </div>
      </div>
      
      {/* Hiển thị lỗi */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center slide-in shadow">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>{error}</span>
        </div>
      )}
      
      {/* Hiển thị kết quả */}
      {studentData && (
        <div className={`transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-primary rounded-xl p-1 mb-6 shadow-lg overflow-hidden">
            <div className="bg-white rounded-lg p-6 flex flex-col md:flex-row items-start gap-4">
              <div className="bg-primary/10 p-5 rounded-lg flex items-center justify-center">
                {FaUserGraduate({ size: 48, className: "text-primary" })}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{studentData.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-2">
                      {FaGraduationCap({ className: "text-blue-600" })}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mã số học sinh</p>
                      <p className="font-medium">{studentData.code}</p>
                    </div>
                  </div>
                  
                  {studentData.class && (
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-2">
                        {FaClipboardList({ className: "text-indigo-600" })}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Lớp</p>
                        <p className="font-medium">{studentData.class}</p>
                      </div>
                    </div>
                  )}
                  
                  {studentData.foreignLanguageCode && (
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-2">
                        {FaLanguage({ className: "text-purple-600" })}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Mã ngoại ngữ</p>
                        <p className="font-medium flex items-center">
                          <span className="mr-1">{studentData.foreignLanguageCode }</span>
                          {/* {getLanguageInfo(studentData.foreignLanguageCode).name} */}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-2">
                      {FaAward({ className: "text-green-600" })}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Điểm trung bình</p>
                      <p className="font-bold text-lg text-primary">
                        {calculateAverage(studentData.scores).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bảng điểm */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                {FaBook({ className: "text-blue-600" })}
              </div>
              <h3 className="text-lg font-semibold">Bảng điểm chi tiết</h3>
            </div>
            
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã môn</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {studentData.scores && Array.isArray(studentData.scores) && studentData.scores.length > 0 ? (
                    studentData.scores.map((score, index) => {
                      const grade = getGradeLabel(score.value);
                      return (
                        <tr key={score.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{score.subject_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{score.subject_code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-lg font-bold text-primary">
                              {score.value === 9.99 ? "10.00" : score.value.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${grade.bg} ${grade.color}`}>
                              {grade.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">
                        Không có dữ liệu điểm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchScores; 