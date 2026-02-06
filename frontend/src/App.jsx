import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/previous-courses" element={<div className="placeholder-page">Previous Courses - Coming Soon</div>} />
          <Route path="/upload-course" element={<div className="placeholder-page">Upload Course - Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
