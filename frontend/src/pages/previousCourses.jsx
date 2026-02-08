import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./previousCourses.css";

const PreviousCourses = () => {
  // Temporary dummy data (backend later)
  const courses = [
    {
      id: 1,
      name: "CS 302 - Data Structures",
      batch: "Batch of 27",
      status: "Completed",
      students: 120,
    },
    {
      id: 2,
      name: "CS 201 - Algorithms",
      batch: "Batch of 26",
      status: "Archived",
      students: 110,
    },
    {
      id: 3,
      name: "CS 101 - Programming Fundamentals",
      batch: "Batch of 25",
      status: "Completed",
      students: 140,
    },
  ];

  return (
    <div className="previous-wrapper">
      <Navbar />

      <main className="previous-main">
        <div className="previous-container">

          {/* Header */}
          <div className="previous-header">
            <h1 className="previous-title">Previous Courses</h1>
            <p className="previous-subtitle">
              View and manage courses from past semesters along with grades and reports.
            </p>
          </div>

          {/* Courses Grid */}
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.name}</h3>
                  <span
                    className={`status ${
                      course.status === "Completed" ? "completed" : "archived"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <p className="batch">{course.batch}</p>

                <div className="course-meta">
                  👨‍🎓 {course.students} Students
                </div>

                <div className="course-action">
                  View Details →
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PreviousCourses;