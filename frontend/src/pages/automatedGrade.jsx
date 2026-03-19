import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./automatedGrade.css";

export default function AutomatedGrade() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [students, setStudents] = useState([]);

  const [weightages, setWeightages] = useState({
    assignments: 30,
    midterm: 30,
    final: 40,
  });

  const [cutoffs, setCutoffs] = useState({
    AA: 90,
    AB: 80,
    BB: 70,
    BC: 60,
    CC: 50,
  });

  // 🔥 Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();

      if (data.success) {
        setCourses(data.courses);

        if (data.courses.length > 0) {
          setCourseId(data.courses[0].courseId);
        }
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // 🔥 Fetch grades
const fetchGrades = async () => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/grading/${courseId}`
    );
    const data = await res.json();

    if (data.success) {
      setStudents(data.grades);
    } else {
      setStudents([]); // 🔥 CLEAR OLD DATA
    }
  } catch (err) {
    console.error("Error fetching grades:", err);
    setStudents([]); // 🔥 also clear on error
  }
};

  // 🔥 Compute grades
  const computeGrades = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/grading/compute/${courseId}`,
        {
          method: "POST",
        }
      );

      fetchGrades();
    } catch (err) {
      console.error("Error computing grades:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      fetchGrades();
    }
  }, [courseId]);

  const handleWeightChange = (key, value) => {
    setWeightages({ ...weightages, [key]: value });
  };

  const handleCutoffChange = (key, value) => {
    setCutoffs({ ...cutoffs, [key]: value });
  };

  return (
    <div className="auto-grade-wrapper">
      <Navbar />

      <main className="auto-grade-main">
        <div className="auto-grade-container">

          <h1 className="page-title">Computed Grades</h1>

          {/* 🔥 COURSE DROPDOWN */}
          <div style={{ marginBottom: "20px" }}>
            <label>Select Course: </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.courseName} ({c.courseId})
                </option>
              ))}
            </select>
          </div>

          {/* 🔥 COMPUTE BUTTON */}
          <button className="compute-btn" onClick={computeGrades}>
            Compute Grades
          </button>

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
                      <th>Total Marks</th>
                      <th>Grade</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s, index) => (
                      <tr key={index}>
                        <td>{s.studentName}</td>
                        <td>{s.studentRollNo}</td>
                        <td>{s.totalMarks}</td>
                        <td className="auto-grade">{s.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* RIGHT — CONTROLS */}
            <div className="auto-right">

              {/* WEIGHTAGES */}
              <section className="card-section">
                <h2 className="section-title">Weightages</h2>

                <table className="grade-table">
                  <tbody>
                    {Object.entries(weightages).map(([k, v]) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>
                          <input
                            type="number"
                            value={v}
                            onChange={(e) =>
                              handleWeightChange(k, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* CUTOFFS */}
              <section className="card-section">
                <h2 className="section-title">Grade Cutoffs</h2>

                <table className="grade-table">
                  <tbody>
                    {Object.entries(cutoffs).map(([g, v]) => (
                      <tr key={g}>
                        <td>{g}</td>
                        <td>
                          <input
                            type="number"
                            value={v}
                            onChange={(e) =>
                              handleCutoffChange(g, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}