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
          <Route path="/upload-marks" element={<UploadMarks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
