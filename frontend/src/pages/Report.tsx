import React, { useState, useEffect } from 'react';
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
import { FaChartBar, FaTable, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { getScoreLevelsBySubject } from '../api';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Hàm hiển thị biểu tượng
const renderIcon = (Icon: IconType, props = {}) => {
  return React.createElement(Icon as React.ComponentType<any>, props);
};

// Chuyển đổi dữ liệu sang định dạng phần trăm
const calculatePercentages = (scoreData: any[]) => {
  return scoreData.map(subject => ({
    subject: subject.subject,
    subjectCode: subject.subjectCode,
    excellent: Math.round((subject.excellent / subject.total) * 100),
    good: Math.round((subject.good / subject.total) * 100),
    average: Math.round((subject.average / subject.total) * 100),
    poor: Math.round((subject.poor / subject.total) * 100),
    total: subject.total
  }));
};

const Report: React.FC = () => {
  const [viewMode, setViewMode] = useState<'absolute' | 'percentage'>('absolute');
  const [chartType, setChartType] = useState<'stacked' | 'grouped'>('stacked');
  const [scoreDataBySubject, setScoreDataBySubject] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getScoreLevelsBySubject();
        setScoreDataBySubject(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching score levels data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hiện loading state khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin text-primary text-4xl">
          {renderIcon(FaSpinner)}
        </div>
      </div>
    );
  }

  // Hiện thông báo lỗi nếu không lấy được dữ liệu
  if (error || !scoreDataBySubject || scoreDataBySubject.length === 0) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error || 'Không có dữ liệu'}</p>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = () => {
    const isPercentage = viewMode === 'percentage';
    const dataToShow = isPercentage ? calculatePercentages(scoreDataBySubject) : scoreDataBySubject;
    
    const labels = dataToShow.map(item => item.subject);
    
    return {
      labels,
      datasets: [
        {
          label: 'Giỏi (≥ 8 điểm)',
          data: dataToShow.map(item => item.excellent),
          backgroundColor: 'rgba(16, 185, 129, 0.8)', // teal-500
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Khá (6-8 điểm)',
          data: dataToShow.map(item => item.good),
          backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Trung bình (4-6 điểm)',
          data: dataToShow.map(item => item.average),
          backgroundColor: 'rgba(245, 158, 11, 0.8)', // amber-500
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Yếu (< 4 điểm)',
          data: dataToShow.map(item => item.poor),
          backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  // Tùy chọn cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: viewMode === 'absolute' 
          ? 'Phân bố số lượng học sinh theo mức điểm và môn học' 
          : 'Phân bố tỷ lệ học sinh theo mức điểm và môn học (%)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return `${context.dataset.label}: ${value}${viewMode === 'percentage' ? '%' : ' học sinh'}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: chartType === 'stacked',
        grid: {
          display: false
        },
        ticks: {
          font: {
            weight: 'bold' as const,
          }
        }
      },
      y: {
        stacked: chartType === 'stacked',
        beginAtZero: true,
        title: {
          display: true,
          text: viewMode === 'absolute' ? 'Số lượng học sinh' : 'Phần trăm (%)',
          font: {
            weight: 'bold' as const,
          }
        },
        ticks: {
          callback: function(value: any) {
            return viewMode === 'percentage' ? `${value}%` : value.toLocaleString();
          }
        }
      },
    },
  };

  // Format số lượng lớn
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6 slide-in">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Báo cáo thống kê điểm số</h1>
      </div>

      {/* Thẻ thông tin */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start mb-2">
        <div className="text-blue-500 mr-3 mt-1">
          <span>{renderIcon(FaInfoCircle, { size: 20 })}</span>
        </div>
        <div>
          <h3 className="font-medium text-blue-800 mb-1">Thống kê theo 4 mức độ điểm</h3>
          <p className="text-blue-600 text-sm">Phân tích số lượng học sinh theo 4 mức độ điểm cho mỗi môn học. Giúp đánh giá tổng quan về chất lượng học tập và xác định môn học cần quan tâm đặc biệt.</p>
        </div>
      </div>

      {/* Điều khiển */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Hiển thị:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 py-1 rounded-md text-sm ${viewMode === 'absolute' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setViewMode('absolute')}
              >
                Số lượng
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${viewMode === 'percentage' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setViewMode('percentage')}
              >
                Phần trăm
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Biểu đồ:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 py-1 rounded-md text-sm ${chartType === 'stacked' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setChartType('stacked')}
              >
                Chồng
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${chartType === 'grouped' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}
                onClick={() => setChartType('grouped')}
              >
                Nhóm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chú thích */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex items-center bg-white rounded-lg p-3 border-l-4 border-teal-500 shadow-sm">
          <div className="bg-teal-100 p-2 rounded-lg mr-3 text-teal-500">
            <span>{renderIcon(FaChartBar, { size: 16 })}</span>
          </div>
          <div>
            <h3 className="font-medium text-teal-600">Giỏi</h3>
            <p className="text-xs text-gray-500">Điểm từ 8.0 đến 10.0</p>
          </div>
        </div>
        
        <div className="flex items-center bg-white rounded-lg p-3 border-l-4 border-blue-500 shadow-sm">
          <div className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-500">
            <span>{renderIcon(FaChartBar, { size: 16 })}</span>
          </div>
          <div>
            <h3 className="font-medium text-blue-600">Khá</h3>
            <p className="text-xs text-gray-500">Điểm từ 6.0 đến cận 8.0</p>
          </div>
        </div>
        
        <div className="flex items-center bg-white rounded-lg p-3 border-l-4 border-amber-500 shadow-sm">
          <div className="bg-amber-100 p-2 rounded-lg mr-3 text-amber-500">
            <span>{renderIcon(FaChartBar, { size: 16 })}</span>
          </div>
          <div>
            <h3 className="font-medium text-amber-600">Trung bình</h3>
            <p className="text-xs text-gray-500">Điểm từ 4.0 đến cận 6.0</p>
          </div>
        </div>
        
        <div className="flex items-center bg-white rounded-lg p-3 border-l-4 border-red-500 shadow-sm">
          <div className="bg-red-100 p-2 rounded-lg mr-3 text-red-500">
            <span>{renderIcon(FaChartBar, { size: 16 })}</span>
          </div>
          <div>
            <h3 className="font-medium text-red-600">Yếu</h3>
            <p className="text-xs text-gray-500">Điểm dưới 4.0</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="h-96">
          <Bar data={prepareChartData()} options={chartOptions} />
        </div>
      </div>

      {/* Bảng dữ liệu chi tiết */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2 text-gray-600">{renderIcon(FaTable, { size: 16 })}</span>
            Bảng dữ liệu chi tiết
          </h2>
          <div className="text-sm text-gray-500">
            Đơn vị: {viewMode === 'absolute' ? 'Học sinh' : 'Phần trăm (%)'}
          </div>
        </div>
        
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left border-y border-gray-200 font-medium text-gray-600">Môn học</th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-teal-600">
                  Giỏi (≥8)
                </th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-blue-600">
                  Khá (6-8)
                </th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-amber-600">
                  Trung bình (4-6)
                </th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-red-600">
                  Yếu (&lt;4)
                </th>
                <th className="px-4 py-3 text-center border-y border-gray-200 font-medium text-gray-600">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {scoreDataBySubject.map((item) => {
                const percentageExcellent = ((item.excellent / item.total) * 100).toFixed(1);
                const percentageGood = ((item.good / item.total) * 100).toFixed(1);
                const percentageAverage = ((item.average / item.total) * 100).toFixed(1);
                const percentagePoor = ((item.poor / item.total) * 100).toFixed(1);
                
                return (
                  <tr key={item.subjectCode} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-4 py-3 font-medium">
                      {item.subject}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {viewMode === 'absolute' 
                        ? <span className="font-medium text-teal-600">{formatNumber(item.excellent)}</span>
                        : <span className="font-medium text-teal-600">{percentageExcellent}%</span>
                      }
                      {viewMode === 'absolute' && (
                        <span className="text-xs text-gray-500 block">({percentageExcellent}%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {viewMode === 'absolute' 
                        ? <span className="font-medium text-blue-600">{formatNumber(item.good)}</span>
                        : <span className="font-medium text-blue-600">{percentageGood}%</span>
                      }
                      {viewMode === 'absolute' && (
                        <span className="text-xs text-gray-500 block">({percentageGood}%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {viewMode === 'absolute' 
                        ? <span className="font-medium text-amber-600">{formatNumber(item.average)}</span>
                        : <span className="font-medium text-amber-600">{percentageAverage}%</span>
                      }
                      {viewMode === 'absolute' && (
                        <span className="text-xs text-gray-500 block">({percentageAverage}%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {viewMode === 'absolute' 
                        ? <span className="font-medium text-red-600">{formatNumber(item.poor)}</span>
                        : <span className="font-medium text-red-600">{percentagePoor}%</span>
                      }
                      {viewMode === 'absolute' && (
                        <span className="text-xs text-gray-500 block">({percentagePoor}%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {formatNumber(item.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report; 