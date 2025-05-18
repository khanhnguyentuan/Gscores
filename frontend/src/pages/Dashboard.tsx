import React from 'react';
import { FaMedal, FaTrophy, FaChartLine, FaGraduationCap } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần cần thiết cho biểu đồ
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Hàm chuẩn hóa điểm số
const normalizeScore = (score: number): number => {
  return score === 9.99 ? 10 : score;
};

// Hàm hiển thị điểm số
const formatScore = (score: number): string => {
  const normalizedScore = normalizeScore(score);
  return normalizedScore === 10 ? "10" : normalizedScore.toFixed(2);
};

// Dữ liệu cứng từ API đã chạy sẵn
const topStudentsData = {
  "topStudents": [
    {
      "rank": 1,
      "student": {
        "id": "26020938",
        "name": "Học sinh 26020938",
        "studentCode": "26020938"
      },
      "scores": {
        "toan": 9.6,
        "vat_li": 9.99,
        "hoa_hoc": 9.99
      },
      "total": 29.58,
      "average": 9.86
    },
    {
      "rank": 2,
      "student": {
        "id": "26009943",
        "name": "Học sinh 26009943",
        "studentCode": "26009943"
      },
      "scores": {
        "toan": 9.8,
        "vat_li": 9.75,
        "hoa_hoc": 9.99
      },
      "total": 29.54,
      "average": 9.85
    },
    {
      "rank": 3,
      "student": {
        "id": "19016615",
        "name": "Học sinh 19016615",
        "studentCode": "19016615"
      },
      "scores": {
        "toan": 9.6,
        "vat_li": 9.75,
        "hoa_hoc": 9.99
      },
      "total": 29.34,
      "average": 9.78
    },
    {
      "rank": 4,
      "student": {
        "id": "19013166",
        "name": "Học sinh 19013166",
        "studentCode": "19013166"
      },
      "scores": {
        "toan": 9.8,
        "vat_li": 9.75,
        "hoa_hoc": 9.75
      },
      "total": 29.3,
      "average": 9.77
    },
    {
      "rank": 5,
      "student": {
        "id": "55006046",
        "name": "Học sinh 55006046",
        "studentCode": "55006046"
      },
      "scores": {
        "toan": 9.8,
        "vat_li": 9.5,
        "hoa_hoc": 9.99
      },
      "total": 29.29,
      "average": 9.76
    },
    {
      "rank": 6,
      "student": {
        "id": "26014736",
        "name": "Học sinh 26014736",
        "studentCode": "26014736"
      },
      "scores": {
        "toan": 9.8,
        "vat_li": 9.5,
        "hoa_hoc": 9.99
      },
      "total": 29.29,
      "average": 9.76
    },
    {
      "rank": 7,
      "student": {
        "id": "28035804",
        "name": "Học sinh 28035804",
        "studentCode": "28035804"
      },
      "scores": {
        "toan": 9.2,
        "vat_li": 9.99,
        "hoa_hoc": 9.99
      },
      "total": 29.18,
      "average": 9.73
    },
    {
      "rank": 8,
      "student": {
        "id": "32005631",
        "name": "Học sinh 32005631",
        "studentCode": "32005631"
      },
      "scores": {
        "toan": 9.2,
        "vat_li": 9.99,
        "hoa_hoc": 9.99
      },
      "total": 29.18,
      "average": 9.73
    },
    {
      "rank": 9,
      "student": {
        "id": "19002020",
        "name": "Học sinh 19002020",
        "studentCode": "19002020"
      },
      "scores": {
        "toan": 9.2,
        "vat_li": 9.99,
        "hoa_hoc": 9.99
      },
      "total": 29.18,
      "average": 9.73
    },
    {
      "rank": 10,
      "student": {
        "id": "03005012",
        "name": "Học sinh 03005012",
        "studentCode": "03005012"
      },
      "scores": {
        "toan": 9.4,
        "vat_li": 9.75,
        "hoa_hoc": 9.99
      },
      "total": 29.14,
      "average": 9.71
    }
  ],
  "pagination": {
    "total": 1061605,
    "limit": 10,
    "offset": 0
  }
};

// Tính lại tổng điểm và điểm trung bình sau khi chuẩn hóa điểm 9.99 -> 10
const normalizedStudentsData = {
  ...topStudentsData,
  topStudents: topStudentsData.topStudents.map(student => {
    // Chuẩn hóa điểm
    const normalizedScores = {
      toan: normalizeScore(student.scores.toan),
      vat_li: normalizeScore(student.scores.vat_li),
      hoa_hoc: normalizeScore(student.scores.hoa_hoc)
    };
    
    // Tính lại tổng điểm và điểm trung bình
    const normalizedTotal = normalizedScores.toan + normalizedScores.vat_li + normalizedScores.hoa_hoc;
    const normalizedAverage = normalizedTotal / 3;
    
    return {
      ...student,
      scores: normalizedScores,
      total: parseFloat(normalizedTotal.toFixed(2)),
      average: parseFloat(normalizedAverage.toFixed(2))
    };
  })
};

const Dashboard: React.FC = () => {
  // Hiển thị biểu tượng huy chương cho top 3
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return FaTrophy({ className: "text-yellow-500", size: 24 });
      case 2:
        return FaMedal({ className: "text-gray-400", size: 24 });
      case 3:
        return FaMedal({ className: "text-amber-700", size: 24 });
      default:
        return <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full font-semibold">{rank}</span>;
    }
  };

  // Dữ liệu cho biểu đồ so sánh điểm các môn học
  const chartData = {
    labels: normalizedStudentsData.topStudents.slice(0, 5).map(item => `HS ${item.student.studentCode.slice(-4)}`),
    datasets: [
      {
        label: 'Toán',
        data: normalizedStudentsData.topStudents.slice(0, 5).map(item => item.scores.toan),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Vật lý',
        data: normalizedStudentsData.topStudents.slice(0, 5).map(item => item.scores.vat_li),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
      {
        label: 'Hóa học',
        data: normalizedStudentsData.topStudents.slice(0, 5).map(item => item.scores.hoa_hoc),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'So sánh điểm số Top 5 học sinh',
      },
    },
    scales: {
      y: {
        min: 8.5,
        max: 10,
      },
    },
  };

  // Tính toán thống kê tổng quan
  const totalMathScore = normalizedStudentsData.topStudents.reduce((sum, item) => sum + item.scores.toan, 0);
  const totalPhysicsScore = normalizedStudentsData.topStudents.reduce((sum, item) => sum + item.scores.vat_li, 0);
  const totalChemistryScore = normalizedStudentsData.topStudents.reduce((sum, item) => sum + item.scores.hoa_hoc, 0);
  
  const avgMathScore = (totalMathScore / normalizedStudentsData.topStudents.length).toFixed(2);
  const avgPhysicsScore = (totalPhysicsScore / normalizedStudentsData.topStudents.length).toFixed(2);
  const avgChemistryScore = (totalChemistryScore / normalizedStudentsData.topStudents.length).toFixed(2);

  return (
    <div className="slide-in space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <div className="text-sm text-gray-500">
          <span>Tổng học sinh: {normalizedStudentsData.pagination.total.toLocaleString()} | </span>
          <span>Đã lọc: Top {normalizedStudentsData.pagination.limit} học sinh xuất sắc khối A</span>
        </div>
      </div>

      {/* Các thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 font-medium mb-1">Điểm Toán trung bình</p>
              <h3 className="text-2xl font-bold text-blue-500">{avgMathScore}</h3>
              <p className="text-xs text-gray-500 mt-1">Top 10 học sinh xuất sắc</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              {FaGraduationCap({ size: 24, className: "text-blue-500" })}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-pink-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 font-medium mb-1">Điểm Vật lý trung bình</p>
              <h3 className="text-2xl font-bold text-pink-500">{avgPhysicsScore}</h3>
              <p className="text-xs text-gray-500 mt-1">Top 10 học sinh xuất sắc</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-lg">
              {FaChartLine({ size: 24, className: "text-pink-500" })}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-teal-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 font-medium mb-1">Điểm Hóa học trung bình</p>
              <h3 className="text-2xl font-bold text-teal-500">{avgChemistryScore}</h3>
              <p className="text-xs text-gray-500 mt-1">Top 10 học sinh xuất sắc</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              {FaChartLine({ size: 24, className: "text-teal-500" })}
            </div>
          </div>
        </div>
      </div>

      {/* Hai phần chính: Biểu đồ và Bảng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ phân tích */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Phân tích điểm số Top 5</h2>
          <div className="h-80">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </div>

        {/* Top 3 học sinh xuất sắc */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Top 3 học sinh xuất sắc</h2>
          
          <div className="space-y-4">
            {normalizedStudentsData.topStudents.slice(0, 3).map((student) => (
              <div key={student.student.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mr-4">
                  {getRankIcon(student.rank)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{student.student.name}</h3>
                  <p className="text-gray-500 text-sm">Mã học sinh: {student.student.studentCode}</p>
                  <div className="flex space-x-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">Toán: {formatScore(student.scores.toan)}</span>
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded text-xs">Lý: {formatScore(student.scores.vat_li)}</span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-xs">Hóa: {formatScore(student.scores.hoa_hoc)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{student.total}</div>
                  <div className="text-xs text-gray-500">Tổng điểm</div>
                  <div className="text-sm font-medium text-green-600">TB: {student.average}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng xếp hạng */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Bảng xếp hạng đầy đủ</h2>
          <div className="text-sm text-primary">10 học sinh xuất sắc nhất</div>
        </div>
        
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left border-y border-gray-200 font-medium text-gray-600">Xếp hạng</th>
                <th className="px-4 py-3 text-left border-y border-gray-200 font-medium text-gray-600">Học sinh</th>
                <th className="px-4 py-3 text-left border-y border-gray-200 font-medium text-gray-600">Mã số</th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-gray-600">Toán</th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-gray-600">Vật lý</th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-gray-600">Hóa học</th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-gray-600">TB</th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-gray-600">Tổng điểm</th>
              </tr>
            </thead>
            <tbody>
              {normalizedStudentsData.topStudents.map((student) => (
                <tr 
                  key={student.student.id} 
                  className={`hover:bg-gray-50 ${student.rank <= 3 ? 'bg-blue-50' : ''} border-b border-gray-200`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {student.rank <= 3 
                        ? getRankIcon(student.rank)
                        : <span className="text-gray-700 font-medium">{student.rank}</span>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {student.student.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.student.studentCode}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded">{formatScore(student.scores.toan)}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span className="px-2 py-0.5 bg-pink-50 text-pink-800 rounded">{formatScore(student.scores.vat_li)}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded">{formatScore(student.scores.hoa_hoc)}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-green-600">
                    {student.average}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-primary">
                    {student.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 