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

// ----------------------------------------------------------------------------


// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from "./auth/AuthContext";

// import Login from "./pages/Login";
// import ScrollToTop from "./components/ScrollToTop";
// import Dashboard from './pages/dashboard';
// import UploadMarks from "./pages/uploadMarks";
// import PreviousCourses from "./pages/previousCourses";
// import CourseDetails from "./pages/CourseDetails";
// import ConfirmWeightages from "./pages/ConfirmWeightages";
// import AutomatedGrade from "./pages/automatedGrade";
// import ManualGradeAdjustment from "./pages/ManualGradeAdjustment";
// import StatisticalAnalysis from './pages/StatisticalAnalysis';

// import './App.css';

// /**
//  * ProtectedRoute:
//  * - Requires login
//  * - Enforces role-based access
//  */
// function ProtectedRoute({ children, allowedRoles }) {
//   const { user } = useAuth();

//   const isUnauthorized =
//     user && allowedRoles && !allowedRoles.includes(user.role);

//   useEffect(() => {
//     if (isUnauthorized) {
//       window.alert("You do not have permission to access this page.");
//     }
//   }, [isUnauthorized]);

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (isUnauthorized) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

// /**
//  * PublicRoute:
//  * - Blocks access if already logged in
//  */
// function PublicRoute({ children }) {
//   const { user } = useAuth();

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <ScrollToTop />

//         <Routes>

//           {/* Login → only if NOT logged in */}
//           <Route
//             path="/login"
//             element={
//               <PublicRoute>
//                 <Login />
//               </PublicRoute>
//             }
//           />

//           {/* Default redirect */}
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />

//           {/* Student + Professor */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["student", "professor"]}>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/previous-courses"
//             element={
//               <ProtectedRoute allowedRoles={["student", "professor"]}>
//                 <PreviousCourses />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/viewdetails/:courseid"
//             element={
//               <ProtectedRoute allowedRoles={["student", "professor"]}>
//                 <CourseDetails />
//               </ProtectedRoute>
//             }
//           />

//           {/* Professor ONLY */}
//           <Route
//             path="/confirm-weightages"
//             element={
//               <ProtectedRoute allowedRoles={["professor"]}>
//                 <ConfirmWeightages />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/upload-marks"
//             element={
//               <ProtectedRoute allowedRoles={["professor"]}>
//                 <UploadMarks />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/automated-grade"
//             element={
//               <ProtectedRoute allowedRoles={["professor"]}>
//                 <AutomatedGrade />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/automated-grade/:courseId"
//             element={
//               <ProtectedRoute allowedRoles={["professor"]}>
//                 <AutomatedGrade />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/manual-grade-adjustment"
//             element={
//               <ProtectedRoute allowedRoles={["professor"]}>
//                 <ManualGradeAdjustment />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/manual-grade-adjustment/:courseId"
//             element={
//               <ProtectedRoute allowedRoles={["professor"]}>
//                 <ManualGradeAdjustment />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/statistical-analysis"
//             element={
//               <ProtectedRoute allowedRoles={["professor"]}>
//                 <StatisticalAnalysis />
//               </ProtectedRoute>
//             }
//           />

//           {/* Catch-all */}
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />

//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

// ----------------------------------------------------------------------------

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
          <Route path="/manual-grade-adjustment/:courseId" element={<ManualGradeAdjustment />} />
          <Route path="/statistical-analysis" element={<StatisticalAnalysis />} />
          <Route path="/automated-grade/:courseId" element={<AutomatedGrade />} />
        </Routes>
      </div>
    </Router>
  );
}
 
export default App;