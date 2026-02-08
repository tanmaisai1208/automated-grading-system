import React from "react";
import "./HelpModal.css";

const HelpModal = ({ onClose }) => {
  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>Documentation & Help</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="help-modal-content">
          <section>
            <h3>📂 Excel Marksheet Format</h3>
            <ul>
              <li>Each row represents one student</li>
              <li>Columns: Roll No, Mid, End, Assignment, Quiz</li>
              <li>Weightages should be mentioned in column headers</li>
            </ul>
          </section>

          <section>
            <h3>⚙️ Grading Workflow</h3>
            <ol>
              <li>Upload Excel marksheet</li>
              <li>Total marks calculated (out of 100)</li>
              <li>Automated grading using statistics</li>
              <li>Optional manual grade adjustment</li>
            </ol>
          </section>

          <section>
            <h3>📊 Automated vs Manual Grading</h3>
            <p>
              Automated grading uses mean and standard deviation (σ/2 steps).
              Manual grading allows instructors to override grade cutoffs.
            </p>
          </section>

          <section className="help-note">
            <strong>Tip:</strong> Ensure all marks are numeric and there are no
            empty cells before upload.
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
