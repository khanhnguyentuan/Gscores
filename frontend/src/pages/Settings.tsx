import React, { useState } from 'react';
import { FaSave, FaRedo, FaMoon, FaSun } from 'react-icons/fa';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveSettings = () => {
    // Giả lập lưu cài đặt
    setSuccessMessage('Cài đặt đã được lưu thành công!');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleResetSettings = () => {
    setDarkMode(false);
    setFontSize('medium');
    setSuccessMessage('Cài đặt đã được khôi phục về mặc định!');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="slide-in">
      <h1 className="text-2xl font-bold mb-6">Cài đặt hệ thống</h1>

      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 fade-in">
          {successMessage}
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">Tùy chỉnh giao diện</h2>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Chế độ tối:</span>
              {darkMode ? FaMoon({ className: "text-primary" }) : FaSun({ className: "text-yellow-500" })}
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Kích thước font chữ:</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="small">Nhỏ</option>
            <option value="medium">Vừa</option>
            <option value="large">Lớn</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSaveSettings}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary/90 transition-colors"
        >
          {FaSave({ className: "mr-2" })}
          <span>Lưu cài đặt</span>
        </button>
        <button
          onClick={handleResetSettings}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-500 transition-colors"
        >
          {FaRedo({ className: "mr-2" })}
          <span>Khôi phục mặc định</span>
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-lg font-medium mb-4">Về phần mềm</h2>
        <div className="text-gray-600">
          <p className="mb-2">G-Scores - Hệ thống quản lý điểm số</p>
          <p className="mb-2">Phiên bản: 1.0.0</p>
          <p className="mb-2">Được phát triển bởi: Nguyễn Tuấn Khanh</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 