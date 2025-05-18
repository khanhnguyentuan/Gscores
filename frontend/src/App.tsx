import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SearchScores from './pages/SearchScores';
import Report from './pages/Report';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<SearchScores />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="report" element={<Report />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App; 