import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaSearch, FaChartBar, FaRegFileAlt, FaCog, FaBars, FaTimes } from 'react-icons/fa';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - với animation */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-0 -ml-6'} sidebar-gradient flex flex-col shadow-xl transition-all duration-300 ease-in-out z-30 fixed md:relative h-full`}
      >
        <div className="p-5 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">G-Scores</h1>
          <div className="h-0.5 bg-white/20 mt-4 rounded-full mx-auto w-16"></div>
        </div>
        
        <nav className="mt-8 px-4 flex-grow">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white/90 text-primary shadow-md font-medium translate-x-2' 
                      : 'text-white hover:bg-white/20'
                  } transform hover:translate-x-1 duration-200`
                }
              >
                {FaSearch({ className: "mr-3 text-lg" })}
                <span>Tra cứu điểm</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white/90 text-primary shadow-md font-medium translate-x-2' 
                      : 'text-white hover:bg-white/20'
                  } transform hover:translate-x-1 duration-200`
                }
              >
                {FaChartBar({ className: "mr-3 text-lg" })}
                <span>Bảng điều khiển</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/report" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white/90 text-primary shadow-md font-medium translate-x-2' 
                      : 'text-white hover:bg-white/20'
                  } transform hover:translate-x-1 duration-200`
                }
              >
                {FaRegFileAlt({ className: "mr-3 text-lg" })}
                <span>Báo cáo</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white/90 text-primary shadow-md font-medium translate-x-2' 
                      : 'text-white hover:bg-white/20'
                  } transform hover:translate-x-1 duration-200`
                }
              >
                {FaCog({ className: "mr-3 text-lg" })}
                <span>Cài đặt</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 text-white/60 text-xs text-center mt-auto mb-4">
          <p>G-Scores - Nguyễn Tuấn Khanh - Intern web</p>
          <p>© 2025 All Rights Reserved</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Header */}
        <header className="header-bg flex items-center justify-between p-4 text-white shadow-lg z-20">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-full hover:bg-white/20 transition-colors mr-3 md:hidden"
            >
              {isSidebarOpen ? FaTimes({ size: 18 }) : FaBars({ size: 18 })}
            </button>
            <h2 className="text-xl font-medium">Hệ thống quản lý điểm số</h2>
          </div>
          
          <div className="flex items-center">
            <div className="bg-white/20 text-sm py-1 px-3 rounded-full text-white">
              Phiên bản 1.0
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-gray-50">
          <div className="bg-white rounded-xl shadow-md p-5 max-w-7xl mx-auto fade-in border border-gray-100">
            <Outlet />
          </div>
          
          <footer className="text-center text-gray-500 text-xs mt-8 pb-4">
            Powered by G-Scores Education Dashboard
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout; 