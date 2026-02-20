import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from './pages/dashboard';
import UploadMarks from "./pages/uploadMarks";
import PreviousCourses from "./pages/previousCourses";
import CourseDetails from "./pages/CourseDetails";
import ConfirmWeightages from "./pages/ConfirmWeightages";
import AutomatedGrade from "./pages/automatedGrade";
import ManualGradeAdjustment from "./pages/ManualGradeAdjustment";
import StatisticalAnalysis from './pages/StatisticalAnalysis';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}
function App() {
  return (
    <Router>
      <div className="App">
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/confirm-weightages" element={<ConfirmWeightages />} />
          <Route path="/previous-courses" element={<PreviousCourses />} />
          <Route path="/upload-marks" element={<UploadMarks />} />
          <Route path="/course-details" element={<CourseDetails />} />
          <Route path="/automated-grade" element={<AutomatedGrade />} />
          <Route path="/manual-grade-adjustment" element={<ManualGradeAdjustment />} />
          <Route path="/statistical-analysis" element={<StatisticalAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}
 
export default App;
