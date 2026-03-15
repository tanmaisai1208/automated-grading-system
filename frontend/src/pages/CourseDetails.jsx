// import React from "react";
// import { useParams } from "react-router-dom";
// import Navbar from "../components/navbar";
// import Footer from "../components/footer";
// import "./CourseDetails.css";

// const CourseDetails = () => {
//   const { courseid } = useParams();

//   // Dummy data (will come from backend later)
//   const students = [
//     {
//       sno: 1,
//       name: "Alice Johnson",
//       email: "alice@example.com",
//       roll: "CS21B001",
//       mid: 78,
//       end: 82,
//       quiz: 15,
//       assignment: 18,
//       total: 81,
//       autoGrade: "BB",
//       manualGrade: "AB",
//     },
//     {
//       sno: 2,
//       name: "Bob Smith",
//       email: "bob@example.com",
//       roll: "CS21B002",
//       mid: 65,
//       end: 70,
//       quiz: 12,
//       assignment: 16,
//       total: 69,
//       autoGrade: "BC",
//       manualGrade: "BC",
//     },
//   ];

//   return (
//     <div className="course-details-wrapper">
//       <Navbar />

//       <main className="course-details-main">
//         <div className="course-details-container">
//           {/* Header */}
//           <div className="course-header">
//             <h1 className="course-title">
//               Course Details
//               <span className="course-code">{courseid}</span>
//             </h1>
//             <p className="course-subtitle">
//               Final computed marks and grades for all students
//             </p>
//           </div>

//           {/* Table */}
//           <div className="table-card">
//             <div className="table-scroll">
//               <table className="marks-table">
//                 <thead>
//                   <tr>
//                     <th>S.No</th>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Roll No</th>
//                     <th>Mid Sem</th>
//                     <th>End Sem</th>
//                     <th>Quiz</th>
//                     <th>Assignment</th>
//                     <th>Total (100)</th>
//                     <th>Grade (Auto)</th>
//                     <th>Grade (Manual)</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {students.map((s) => (
//                     <tr key={s.sno}>
//                       <td>{s.sno}</td>
//                       <td>{s.name}</td>
//                       <td>{s.email}</td>
//                       <td>{s.roll}</td>
//                       <td>{s.mid}</td>
//                       <td>{s.end}</td>
//                       <td>{s.quiz}</td>
//                       <td>{s.assignment}</td>
//                       <td className="total-cell">{s.total}</td>
//                       <td className="auto-grade">{s.autoGrade}</td>
//                       <td className="manual-grade">{s.manualGrade}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default CourseDetails;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById } from "../services/courseService";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./CourseDetails.css";

const CourseDetails = () => {
  const { courseid } = useParams();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await getCourseById(courseid);
        setCourse(response.course);
        setStudents(response.course.students || []);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseid]);

  return (
    <div className="course-details-wrapper">
      <Navbar />

      <main className="course-details-main">
        <div className="course-details-container">
          {/* Header */}
          <div className="course-header">
            <h1 className="course-title">
              {course?.courseName || "Course Details"}
              <span className="course-code">{courseid}</span>
            </h1>
            <p className="course-subtitle">
              Final computed marks and grades for all students
            </p>
          </div>

          {loading && <p className="course-subtitle">Loading course details...</p>}

          {/* Table */}
          <div className="table-card">
            <div className="table-scroll">
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll No</th>
                    <th>Mid Sem</th>
                    <th>End Sem</th>
                    <th>Quiz</th>
                    <th>Assignment</th>
                    <th>Total (100)</th>
                    <th>Grade (Auto)</th>
                    <th>Grade (Manual)</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((s, index) => (
                    <tr key={s.studentRollNo || index}>
                      <td>{s.sno || index + 1}</td>
                      <td>{s.studentName}</td>
                      <td>{s.studentEmail}</td>
                      <td>{s.studentRollNo}</td>
                      <td>{s.midsem}</td>
                      <td>{s.endsem}</td>
                      <td>{s.quiz}</td>
                      <td>{s.assignment}</td>
                      <td className="total-cell">{s.totalMarks}</td>
                      <td className="auto-grade">{s.automatedGrade}</td>
                      <td className="manual-grade">{s.manualGrade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetails;