import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./ManualGradeAdjustment.css";

const initialGradeRanges = [
  { grade: "AA", min: 85, max: 100 },
  { grade: "AB", min: 75, max: 84 },
  { grade: "BB", min: 65, max: 74 },
  { grade: "BC", min: 55, max: 64 },
  { grade: "CC", min: 45, max: 54 },
  { grade: "CD", min: 35, max: 44 },
  { grade: "DD", min: 0, max: 34 },
];

const dummyStudents = [
  {
    sno: 1,
    email: "student1@college.edu",
    roll: "CS21B001",
    name: "Rahul Sharma",
    mid: 22,
    end: 48,
    quiz: 8,
    assignment: 7,
    total: 85,
    autoGrade: "AA",
    manualGrade: "AA",
  },
  {
    sno: 2,
    email: "student2@college.edu",
    roll: "CS21B002",
    name: "Ananya Verma",
    mid: 18,
    end: 40,
    quiz: 7,
    assignment: 6,
    total: 71,
    autoGrade: "BB",
    manualGrade: "BB",
  },
];

const ManualGradeAdjustment = () => {
  const [gradeRanges, setGradeRanges] = useState(initialGradeRanges);
  const [students, setStudents] = useState(dummyStudents);

  const handleRangeChange = (index, field, value) => {
    const updated = [...gradeRanges];
    updated[index][field] = Number(value);
    setGradeRanges(updated);
  };

  const recomputeManualGrades = () => {
    const updatedStudents = students.map((student) => {
      const gradeObj = gradeRanges.find(
        (g) => student.total >= g.min && student.total <= g.max
      );
      return {
        ...student,
        manualGrade: gradeObj ? gradeObj.grade : "NA",
      };
    });
    setStudents(updatedStudents);
  };

  return (
    <div className="manual-grade-wrapper">
      <Navbar />

      <main className="manual-grade-main">
        <div className="manual-grade-container">
          <h1 className="page-title">Manual Grade Adjustment</h1>
          <p className="page-subtitle">
            Adjust grade cutoffs manually and recompute student grades.
          </p>

          {/* Grade Range Table */}
          <section className="card-section">
            <h2 className="section-title">Grade Cutoff Ranges</h2>

            <table className="grade-table">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Min Marks</th>
                  <th>Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {gradeRanges.map((g, idx) => (
                  <tr key={g.grade}>
                    <td>{g.grade}</td>
                    <td>
                      <input
                        type="number"
                        value={g.min}
                        onChange={(e) =>
                          handleRangeChange(idx, "min", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={g.max}
                        onChange={(e) =>
                          handleRangeChange(idx, "max", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="primary-btn" onClick={recomputeManualGrades}>
              Apply Manual Cutoffs
            </button>
          </section>

          {/* Student Table */}
          <section className="card-section">
            <h2 className="section-title">Student Marks & Grades</h2>

            <div className="table-scroll">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Email</th>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Mid</th>
                    <th>End</th>
                    <th>Quiz</th>
                    <th>Assignment</th>
                    <th>Total</th>
                    <th>Grade (Auto)</th>
                    <th>Grade (Manual)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.sno}>
                      <td>{s.sno}</td>
                      <td>{s.email}</td>
                      <td>{s.roll}</td>
                      <td>{s.name}</td>
                      <td>{s.mid}</td>
                      <td>{s.end}</td>
                      <td>{s.quiz}</td>
                      <td>{s.assignment}</td>
                      <td>{s.total}</td>
                      <td className="auto-grade">{s.autoGrade}</td>
                      <td className="manual-grade">{s.manualGrade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManualGradeAdjustment;
