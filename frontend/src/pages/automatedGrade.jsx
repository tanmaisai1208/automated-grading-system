import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./automatedGrade.css";

export default function AutomatedGrade() {
  const { courseId } = useParams();
  const decodedCourseId = decodeURIComponent(courseId);

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);

  const [weightages, setWeightages] = useState({
    assignments: 30,
    midterm: 30,
    final: 40,
  });

  /* Fetch grades */
  const fetchGrades = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/${encodeURIComponent(decodedCourseId)}`,
        { credentials: "include" },
      );

      const data = await res.json();
      console.log("FETCH DATA:", data);

      if (data.success && data.data) {
        setStudents(data.data.students || []);
        setStats(data.data.stats || null);
      }
    } catch (err) {
      console.error("Error fetching grades:", err);
      setStudents([]);
      setStats(null);
    }
  };

  /* Compute grades */
  const computeGrades = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/compute/${encodeURIComponent(decodedCourseId)}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json();
      console.log("COMPUTE DATA:", data);

      if (data.success && data.data) {
        setStudents(data.data.students || []);
        setStats(data.data.stats || null);
      }
    } catch (err) {
      console.error("Error computing grades:", err);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchGrades();
    }
  }, [courseId]);

  const handleWeightChange = (key, value) => {
    setWeightages({ ...weightages, [key]: value });
  };

  return (
    <div className="auto-grade-wrapper">
      <Navbar />

      <main className="auto-grade-main">
        <button className="compute-btn floating-btn" onClick={computeGrades}>
          Compute Grades
        </button>
        <div className="auto-grade-container">
          <h1 className="page-title">Computed Grades — {decodedCourseId}</h1>

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
                    {students.length > 0 ? (
                      students.map((s, index) => (
                        <tr key={index}>
                          <td>{s.studentName}</td>
                          <td>{s.studentRollNo}</td>
                          <td>{s.totalMarks}</td>
                          <td className="auto-grade">
                            {s.automatedGrade || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No student data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* RIGHT — WEIGHTAGES + STATS */}
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

              {/* RELATIVE GRADING STATS */}
              <section className="card-section">
                <h2 className="section-title">Relative Grade Boundaries</h2>

                {stats ? (
                  <table className="grade-table">
                    <tbody>
                      <tr>
                        <td>Mean</td>
                        <td>{stats.mean ?? "-"}</td>
                      </tr>
                      <tr>
                        <td>Std Dev</td>
                        <td>{stats.sd ?? "-"}</td>
                      </tr>

                      {stats.boundaries &&
                        Object.entries(stats.boundaries).map(
                          ([grade, value]) => (
                            <tr key={grade}>
                              <td>{grade}</td>
                              <td>{value}</td>
                            </tr>
                          ),
                        )}
                    </tbody>
                  </table>
                ) : (
                  <p>No stats available</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      <button className="compute-btn floating-btn" onClick={computeGrades}>
        Compute Grades
      </button>

      <Footer />

      <Footer />
    </div>
  );
}
