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
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ScrollToTop />

          <Routes>

            {/* Landing page = Login */}
            <Route path="/" element={<Login />} />

            {/* Protected pages */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/confirm-weightages"
              element={
                <PrivateRoute>
                  <ConfirmWeightages />
                </PrivateRoute>
              }
            />

            <Route
              path="/previous-courses"
              element={
                <PrivateRoute>
                  <PreviousCourses />
                </PrivateRoute>
              }
            />

            <Route
              path="/upload-marks"
              element={
                <PrivateRoute>
                  <UploadMarks />
                </PrivateRoute>
              }
            />

            <Route
              path="/course-details"
              element={
                <PrivateRoute>
                  <CourseDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/automated-grade"
              element={
                <PrivateRoute>
                  <AutomatedGrade />
                </PrivateRoute>
              }
            />

            <Route
              path="/manual-grade-adjustment"
              element={
                <PrivateRoute>
                  <ManualGradeAdjustment />
                </PrivateRoute>
              }
            />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
