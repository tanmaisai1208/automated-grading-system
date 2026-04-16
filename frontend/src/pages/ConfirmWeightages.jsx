import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useNavigate, useLocation } from "react-router-dom";
import "./ConfirmWeightages.css";

const ConfirmWeightages = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [courseData, setCourseData] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // data structure from uploadMarks: { success, message, course }
    const res = location.state;

    if (!res || !res.course) {
      alert("No course data found. Please upload marks first.");
      navigate("/upload-marks");
      return;
    }

    const course = res.course;
    setCourseData(course);

    // Filter out system columns from the first student to find marking components
    if (course.students && course.students.length > 0) {
      const student = course.students[0];
      const systemFields = ["sno", "studentName", "studentRollNo", "totalMarks", "automatedGrade", "manualGrade"];

      const markingFields = Object.keys(student).filter(
        (key) => !systemFields.includes(key)
      );

      // Create component list with initial weightages if any
      const initialWeightages = course.weightages || {};
      const componentList = markingFields.map((field) => ({
        id: field,
        name: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'), // Simple pretty print
        weightage: initialWeightages[field] || "",
      }));

      setComponents(componentList);
    }

    setLoading(false);
  }, [location, navigate]);

  const handleChange = (index, value) => {
    const updated = [...components];
    updated[index].weightage = value;
    setComponents(updated);
  };

  const totalWeightage = components.reduce(
    (sum, c) => sum + (Number(c.weightage) || 0),
    0
  );

  const handleSubmit = async () => {
    if (totalWeightage !== 100) {
      alert("Total weightage must be 100%");
      return;
    }

    try {
      // Map components back to key:value for backend
      const weightageObj = {};
      components.forEach((c) => {
        weightageObj[c.id] = Number(c.weightage);
      });

      const res = await fetch(`${BASE_URL}/api/grading/config/${courseData.courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ weightages: weightageObj }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save weightages");
      }

      alert("Weightages confirmed successfully!");
      // Navigate to automated grade page for this specific course
      navigate(`/automated-grade/${courseData.courseId}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Operation failed");
    }
  };

  if (loading) return <div className="confirm-wrapper"><Navbar /><main className="confirm-main">Loading...</main><Footer /></div>;

  return (
    <div className="confirm-wrapper">
      <Navbar />

      <main className="confirm-main">
        <div className="confirm-container">
          <header className="confirm-header">
            <h1>Confirm Course Weightages</h1>
            <p>
              Review the extracted weightages for <strong>{courseData?.courseId}</strong>.
              You may modify or add missing values before proceeding.
            </p>
          </header>

          <section className="weightage-card">
            <table className="weightage-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Weightage (%)</th>
                </tr>
              </thead>
              <tbody>
                {components.length > 0 ? (
                  components.map((comp, index) => (
                    <tr key={index}>
                      <td className="component-name">{comp.name}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter %"
                          value={comp.weightage}
                          onChange={(e) =>
                            handleChange(index, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center", padding: "2rem" }}>
                      No marking components found in this sheet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="weightage-summary">
              <span>Total Weightage</span>
              <span
                className={`total-value ${totalWeightage === 100 ? "valid" : "invalid"
                  }`}
              >
                {totalWeightage}%
              </span>
            </div>

            <div className="confirm-actions">
              <button
                className="confirm-btn"
                disabled={totalWeightage !== 100 || components.length === 0}
                onClick={handleSubmit}
              >
                Confirm & Proceed
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmWeightages;

