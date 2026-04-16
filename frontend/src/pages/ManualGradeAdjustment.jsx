import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./automatedGrade.css";

const gradeOrder = ["AA", "AB", "BB", "BC", "CC", "CD", "DD"];

export default function ManualGradeAdjustment() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { courseId } = useParams();
  const decodedCourseId = decodeURIComponent(courseId);

  const [students, setStudents] = useState([]);

  /* Fetch students */
  const fetchStudents = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/grading/${encodeURIComponent(decodedCourseId)}`
      );

      const data = await res.json();

      if (data.success && data.data) {
        const updated = data.data.students.map((s) => ({
          ...s,
          manualGrade: s.manualGrade || s.automatedGrade,
        }));

        setStudents(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  /* Change grade */
  const changeGrade = (index, dir) => {
    const updated = [...students];

    let current = updated[index].manualGrade;
    let idx = gradeOrder.indexOf(current);

    if (dir === "up" && idx > 0) idx--;
    if (dir === "down" && idx < gradeOrder.length - 1) idx++;

    updated[index].manualGrade = gradeOrder[idx];
    setStudents(updated);
  };

  /* Save manual grades */
const saveManualGrades = async () => {
  try {
    await fetch(
      `${BASE_URL}/api/grading/manual/${encodeURIComponent(decodedCourseId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ students }),
      }
    );

    alert("Manual grades saved!");
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="auto-grade-wrapper">
      <Navbar />

      <main className="auto-grade-main">
        <button className="compute-btn floating-btn" onClick={saveManualGrades}>
          Save Manual Grades
        </button>

        <div className="auto-grade-container">
          <h1 className="page-title">
            Manual Grade Adjustment — {decodedCourseId}
          </h1>

          <div className="auto-layout">
            {/* LEFT — STUDENT TABLE */}
            <section className="card-section auto-left">
              <h2 className="section-title">Student Grades</h2>

              <div className="table-scroll">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll No</th>
                      <th>Total</th>
                      <th>Auto Grade</th>
                      <th>Manual Grade</th>
                      <th>Adjust</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s, index) => (
                      <tr key={index}>
                        <td>{s.studentName}</td>
                        <td>{s.studentRollNo}</td>
                        <td>{s.totalMarks}</td>
                        <td className="auto-grade">
                          {s.automatedGrade}
                        </td>
                        <td className="manual-grade">
                          {s.manualGrade}
                        </td>
                        <td>
                          <button
                            onClick={() => changeGrade(index, "up")}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => changeGrade(index, "down")}
                          >
                            ↓
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* RIGHT PANEL */}
            <div className="auto-right">
              <section className="card-section">
                <h2 className="section-title">
                  Manual Grade Instructions
                </h2>

                <p>
                  Use ↑ or ↓ to adjust student grades manually.
                  Manual grades will override automated grades.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}