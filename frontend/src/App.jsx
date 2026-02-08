import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import UploadMarks from "./pages/uploadMarks";
import PreviousCourses from "./pages/previousCourses";
import ScrollToTop from "./components/ScrollToTop";
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/previous-courses" element={<PreviousCourses />} />
          <Route path="/previous-courses" element={<div className="placeholder-page">Previous Courses - Coming Soon</div>} />
          <Route path="/upload-marks" element={<UploadMarks />} />
          <Route path="/upload-course" element={<div className="placeholder-page">Upload Course - Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
