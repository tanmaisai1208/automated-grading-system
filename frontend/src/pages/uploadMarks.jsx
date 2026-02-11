import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./uploadMarks.css";

const UploadMarks = () => {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [batch, setBatch] = useState("");
  const [coordinators, setCoordinators] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!courseName || !batch || !file) {
      alert("Please fill all required fields and select an Excel file");
      return;
    }

    const uploadData = {
      courseName,
      batch,
      coordinators,
      fileName: file.name,
    };

    console.log("Upload Data:", uploadData);

    // Navigate to Confirm Weightages page
    navigate("/confirm-weightages");
  };

  return (
    <div className="upload-wrapper">
      <Navbar />

      <main className="upload-main">
        <div className="upload-container">

          {/* Page Header */}
          <div className="upload-header">
            <h1 className="upload-title">Upload New Course</h1>
            <p className="upload-subtitle">
              Enter course details and upload the Excel marksheet to generate
              grades, analytics, and reports.
            </p>
          </div>

          {/* Upload Card */}
          <div className="upload-card">

            {/* Course Details Section */}
            <div className="section">
              <h2 className="section-title">Course Details</h2>

              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. CS 202 - Data Structures"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Batch</label>
                <input
                  type="text"
                  placeholder="e.g. Batch of 27"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                />
              </div>

              {/* OPTIONAL FIELD */}
              <div className="form-group optional">
                <label>Course Co-ordinators (optional)</label>
                <input
                  type="text"
                  value={coordinators}
                  onChange={(e) => setCoordinators(e.target.value)}
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="section">
              <h2 className="section-title">Upload Excel Sheet</h2>

              {/* THIS WRAPPER FIXES THE GAP */}
              <div className="upload-zone">
                <label className="custom-file-btn">
                  Choose Excel File
                  <input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) => setFile(e.target.files[0])}
                    hidden
                  />
                </label>

                <button className="upload-btn" onClick={handleUpload}>
                  Upload Marks →
                </button>
              </div>

              {file && (
                <p className="file-name">
                  Selected File: <strong>{file.name}</strong>
                </p>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadMarks;