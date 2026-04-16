import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./uploadMarks.css";

const UploadMarks = () => {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState("");
  const [professorName, setProfessorName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [file, setFile] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;
  
  const handleUpload = async () => {
    if (!courseId || !professorName || !academicYear || !file) {
      alert("Please fill all required fields and select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("professorName", professorName);
    formData.append("academicYear", academicYear);
    formData.append("file", file);

    try {
      const res = await fetch("${BASE_URL}/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Upload failed");
        return;
      }

      console.log(data);

      navigate("/confirm-weightages", { state: data });

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
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
                <label>Course ID</label>
                <input
                  type="text"
                  placeholder="e.g. CS202"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Professor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sharma"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Academic Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2025-26"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
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