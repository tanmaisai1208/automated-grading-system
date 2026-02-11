import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./AutomatedGrade.css";

const AutomatedGradePage = () => {
  const navigate = useNavigate();

  // 🔹 Hardcoded grade ranges (temporary)
  const gradeRanges = [
    { grade: "AA", min: 90, max: 100, count: 8 },
    { grade: "AB", min: 80, max: 89, count: 15 },
    { grade: "BB", min: 70, max: 79, count: 28 },
    { grade: "BC", min: 60, max: 69, count: 34 },
    { grade: "CC", min: 50, max: 59, count: 31 },
    { grade: "CD", min: 40, max: 49, count: 18 },
    { grade: "FR", min: 0, max: 39, count: 8 },
  ];

  return (
    <div className="auto-grade-wrapper">
      <Navbar />

      <main className="auto-grade-main">
        <div className="auto-grade-container">

          {/* Page Header */}
          <section className="auto-header">
            <div className="header-badge">📊 Automated Grading System</div>
            <h1>Automated Grade Cutoff Preview</h1>
            <p>
              Below are the system-generated grade ranges based on class performance analytics.
              You may continue with automated grading or manually adjust the ranges.
            </p>
          </section>

          {/* Course Info Card */}
          <section className="course-info-card">
            <div className="info-item">
              <span>Course</span>
              <strong>CS201 – Data Structures</strong>
            </div>
            <div className="info-item">
              <span>Exam</span>
              <strong>End Semester</strong>
            </div>
            <div className="info-item">
              <span>Total Students</span>
              <strong>142</strong>
            </div>
          </section>

          {/* Grade Table */}
          <section className="grade-table-section">
            <h2>Generated Grade Ranges</h2>

            <div className="grade-table">
              <div className="table-header">
                <span>Grade</span>
                <span>Min Marks</span>
                <span>Max Marks</span>
                <span>No. of Students</span>
              </div>

              {gradeRanges.map((g, index) => (
                <div key={index} className="table-row">
                  <span className="grade-pill">{g.grade}</span>
                  <span>{g.min}</span>
                  <span>{g.max}</span>
                  <span>{g.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <section className="auto-actions">
            <button
              className="manual-btn"
              onClick={() => navigate("/manual-adjustment")}
            >
              ✏️ Manually Edit Grade Ranges
            </button>

            <button
              className="continue-btn"
              onClick={() => navigate("/finalize-grades")}
            >
              ✅ Continue with Automated Grading
            </button>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AutomatedGradePage;
