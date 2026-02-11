import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./ConfirmWeightages.css";

const ConfirmWeightages = () => {
  // This will later come from backend / Excel parsing
  const initialComponents = [
    { name: "Mid Semester Exam", weightage: 30 },
    { name: "End Semester Exam", weightage: 40 },
    { name: "Assignment 1", weightage: "" },
    { name: "Assignment 2", weightage: "" },
    { name: "Quiz 1", weightage: 10 },
    { name: "Quiz 2", weightage: "" },
  ];

  const [components, setComponents] = useState(initialComponents);

  const handleChange = (index, value) => {
    const updated = [...components];
    updated[index].weightage = value;
    setComponents(updated);
  };

  const totalWeightage = components.reduce(
    (sum, c) => sum + (Number(c.weightage) || 0),
    0
  );

  const handleSubmit = () => {
    // later: send confirmed weightages to backend
    console.log("Confirmed Weightages:", components);
    alert("Weightages confirmed successfully!");
  };

  return (
    <div className="confirm-wrapper">
      <Navbar />

      <main className="confirm-main">
        <div className="confirm-container">
          <header className="confirm-header">
            <h1>Confirm Course Weightages</h1>
            <p>
              Review the extracted weightages from the uploaded Excel sheet.
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
                {components.map((comp, index) => (
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
                ))}
              </tbody>
            </table>

            <div className="weightage-summary">
              <span>Total Weightage</span>
              <span
                className={`total-value ${
                  totalWeightage === 100 ? "valid" : "invalid"
                }`}
              >
                {totalWeightage}%
              </span>
            </div>

            <div className="confirm-actions">
              <button
                className="confirm-btn"
                disabled={totalWeightage !== 100}
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
