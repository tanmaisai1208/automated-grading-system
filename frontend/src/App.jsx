// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
// import ScrollToTop from "./components/ScrollToTop";
// import Dashboard from "./pages/dashboard";
// import UploadMarks from "./pages/uploadMarks";
// import PreviousCourses from "./pages/previousCourses";
// import CourseDetails from "./pages/CourseDetails";
// import ConfirmWeightages from "./pages/ConfirmWeightages";
// import AutomatedGrade from "./pages/automatedGrade";
// import ManualGradeAdjustment from "./pages/ManualGradeAdjustment";
// import StatisticalAnalysis from "./pages/StatisticalAnalysis";

// import ProtectedRoute from "./auth/ProtectedRoute";
// import RoleProtectedRoute from "./auth/RoleProtectedRoute";

// import "./App.css";

// function App() {
//   return (
//     <Router>
//       <ScrollToTop />

//       <Routes>
//         {/* Public Route */}
//         <Route path="/login" element={<Login />} />

//         {/* Default redirect */}
//         <Route path="/" element={<Navigate to="/login" replace />} />

//         {/* Protected Routes (LOGIN REQUIRED) */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/previous-courses"
//           element={
//             <ProtectedRoute>
//               <PreviousCourses />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/viewdetails/:courseid"
//           element={
//             <ProtectedRoute>
//               <CourseDetails />
//             </ProtectedRoute>
//           }
//         />

//         {/* PROFESSOR ONLY ROUTES */}
//         <Route
//           path="/upload-marks"
//           element={
//             <RoleProtectedRoute allowedRoles={["professor"]}>
//               <UploadMarks />
//             </RoleProtectedRoute>
//           }
//         />

//         <Route
//           path="/confirm-weightages"
//           element={
//             <RoleProtectedRoute allowedRoles={["professor"]}>
//               <ConfirmWeightages />
//             </RoleProtectedRoute>
//           }
//         />

//         <Route
//           path="/automated-grade"
//           element={
//             <RoleProtectedRoute allowedRoles={["professor"]}>
//               <AutomatedGrade />
//             </RoleProtectedRoute>
//           }
//         />

//         <Route
//           path="/manual-grade-adjustment"
//           element={
//             <RoleProtectedRoute allowedRoles={["professor"]}>
//               <ManualGradeAdjustment />
//             </RoleProtectedRoute>
//           }
//         />

//         <Route
//           path="/statistical-analysis"
//           element={
//             <RoleProtectedRoute allowedRoles={["professor"]}>
//               <StatisticalAnalysis />
//             </RoleProtectedRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./auth/AuthContext";
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
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/confirm-weightages" element={<ConfirmWeightages />} />
          <Route path="/previous-courses" element={<PreviousCourses />} />
          <Route path="/upload-marks" element={<UploadMarks />} />
          <Route path="/viewdetails/:courseid" element={<CourseDetails />} />
          <Route path="/automated-grade" element={<AutomatedGrade />} />
          <Route path="/manual-grade-adjustment" element={<ManualGradeAdjustment />} />
          <Route path="/statistical-analysis" element={<StatisticalAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}
 
export default App;