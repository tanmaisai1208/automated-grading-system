import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./automatedGrade.css";

export default function AutomatedGrade() {
  const [students] = useState([
    { id: 1, name: "Alice", marks: 88, grade: "AA" },
    { id: 2, name: "Bob", marks: 72, grade: "BB" },
    { id: 3, name: "Charlie", marks: 59, grade: "CC" },
    { id: 4, name: "Charlie", marks: 59, grade: "CC" },
    { id: 5, name: "Charlie", marks: 59, grade: "CC" },
    { id: 6, name: "Charlie", marks: 59, grade: "CC" },
    { id: 7, name: "Charlie", marks: 59, grade: "CC" },
    { id: 8, name: "Charlie", marks: 59, grade: "CC" },
    { id: 9, name: "Charlie", marks: 59, grade: "CC" },
    { id: 10, name: "Charlie", marks: 59, grade: "CC" },
    { id: 11, name: "Charlie", marks: 59, grade: "CC" },
    { id: 12, name: "Charlie", marks: 59, grade: "CC" },
  ]);

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
          <p className="page-subtitle">
            Automatically generated grades based on analytics.
            You may adjust weightages and cutoffs.
          </p>

          <div className="auto-layout">

            {/* LEFT — STUDENT TABLE */}
            <section className="card-section auto-left">
              <h2 className="section-title">Student Grades</h2>

              <div className="table-scroll">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Marks</th>
                      <th>Grade</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.marks}</td>
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
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Weight</th>
                    </tr>
                  </thead>

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
                  <thead>
                    <tr>
                      <th>Grade</th>
                      <th>Min Marks</th>
                    </tr>
                  </thead>

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
