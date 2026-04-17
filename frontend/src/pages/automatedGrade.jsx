import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./automatedGrade.css";

const gradeOrder = ["AA", "AB", "BB", "BC", "CC", "CD", "DD"];

export default function AutomatedGrade() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const decodedCourseId = decodeURIComponent(courseId);

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // "weightage" | "boundary" | null
  const [editMode, setEditMode] = useState(null);

  const [weightages, setWeightages] = useState({});
  const [boundaries, setBoundaries] = useState({});

  /* ── helpers ── */
  const gradeCountMap = () => {
    const map = {};
    gradeOrder.forEach((g) => (map[g] = 0));
    students.forEach((s) => {
      const g = s.manualGrade || s.automatedGrade;
      if (map[g] !== undefined) map[g]++;
    });
    return map;
  };

  /* ── fetch config ── */
  const fetchConfig = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/config/${encodeURIComponent(decodedCourseId)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success && data.config) {
        if (data.config.weightages && Object.keys(data.config.weightages).length > 0)
          setWeightages(data.config.weightages);
      }
    } catch (err) {
      console.error("Config fetch error:", err);
    }
  };

  /* ── compute grades ── */
  const computeGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/compute/${encodeURIComponent(decodedCourseId)}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      if (data.success && data.data) {
        const updated = (data.data.students || []).map((s) => ({
          ...s,
          manualGrade: s.manualGrade || s.automatedGrade,
        }));
        setStudents(updated);
        setStats(data.data.stats || null);
        if (data.data.stats?.boundaries)
          setBoundaries({ ...data.data.stats.boundaries });
      }
    } catch (err) {
      console.error("Compute error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchConfig().then(() => computeGrades());
    }
  }, [courseId]);

  /* ── inline manual grade adjust ── */
  const changeGrade = (index, dir) => {
    const updated = [...students];
    let idx = gradeOrder.indexOf(updated[index].manualGrade);
    if (dir === "up" && idx > 0) idx--;
    if (dir === "down" && idx < gradeOrder.length - 1) idx++;
    updated[index].manualGrade = gradeOrder[idx];
    setStudents(updated);
  };

  /* ── apply weightage changes → recompute ── */
  const applyWeightageEdit = async () => {
  try {
    const configRes = await fetch(
      `http://localhost:5000/api/grading/config/${encodeURIComponent(decodedCourseId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ weightages }),
      }
    );

    const configData = await configRes.json();
    if (!configData.success) {
      alert("Failed to save weightages: " + (configData.message || "unknown error"));
      return;
    }

    // Now recompute — service will re-sum totalMarks from components
    await computeGrades();
    setEditMode(null);
  } catch (err) {
    console.error("Weightage apply error:", err);
    alert("Failed to apply weightage changes.");
  }
};

  /* ── apply boundary changes → reassign grades client-side ── */
  const applyBoundaryEdit = () => {
    const updated = students.map((s) => {
      let grade = "F";
      for (const g of gradeOrder) {
        if (s.totalMarks >= (boundaries[g] ?? -Infinity)) {
          grade = g;
          break;
        }
      }
      return { ...s, automatedGrade: grade, manualGrade: grade };
    });
    setStudents(updated);
    setStats((prev) => ({ ...prev, boundaries: { ...boundaries } }));
    setEditMode(null);
  };

  /* ── save & redirect ── */
  const saveChanges = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/grading/manual/${encodeURIComponent(decodedCourseId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ students }),
        }
      );
      navigate(`/viewdetails/${encodeURIComponent(decodedCourseId)}`);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save grades.");
    }
  };

  const countMap = gradeCountMap();

  return (
    <div className="auto-grade-wrapper">
      <Navbar />

      <main className="auto-grade-main">
        {/* ── floating actions ── */}
        <div className="floating-actions">
          <button className="compute-btn floating-btn" onClick={computeGrades}>
            Recompute
          </button>
          <button className="compute-btn floating-btn save-btn" onClick={saveChanges}>
            Save Changes
          </button>
        </div>

        <div className="auto-grade-container">
          <h1 className="page-title">Computed Grades — {decodedCourseId}</h1>

          {loading ? (
            <p className="loading-text">Computing grades...</p>
          ) : (
            <>
              {/* ══ TOP LAYOUT: grade summary + edit panel ══ */}
              <div className="auto-layout">

                {/* LEFT — Grade Distribution Table */}
                <section className="card-section auto-left">
                  <h2 className="section-title">Grade Distribution</h2>
                  <div className="table-scroll">
                    <table className="student-table">
                      <thead>
                        <tr>
                          <th>Grade</th>
                          <th>Min Marks (≥)</th>
                          <th>Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeOrder.map((grade) => (
                          <tr key={grade}>
                            <td className="auto-grade">{grade}</td>
                            <td>{stats?.boundaries?.[grade] ?? "-"}</td>
                            <td>{countMap[grade] ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* RIGHT — Edit Panel */}
                <div className="auto-right">

                  {/* Mode selector */}
                  <section className="card-section">
                    <h2 className="section-title">Edit Mode</h2>
                    <p className="edit-mode-note">
                      Only one can be active at a time. Switching will discard
                      unsaved changes in the other.
                    </p>
                    <div className="mode-btn-row">
                      <button
                        className={`mode-btn ${editMode === "weightage" ? "active" : ""}`}
                        onClick={() =>
                          setEditMode(editMode === "weightage" ? null : "weightage")
                        }
                      >
                        Edit Weightages
                      </button>
                      <button
                        className={`mode-btn ${editMode === "boundary" ? "active" : ""}`}
                        onClick={() =>
                          setEditMode(editMode === "boundary" ? null : "boundary")
                        }
                      >
                        Edit Boundaries
                      </button>
                    </div>
                  </section>

                  {/* Weightage editor */}
                  {editMode === "weightage" && (
                    <section className="card-section">
                      <h2 className="section-title">Weightages</h2>
                      <p className="edit-mode-note">
                        Changing weightages will recompute total marks and grades.
                      </p>
                      <table className="grade-table">
                        <tbody>
                          {Object.entries(weightages).map(([k, v]) => (
                            <tr key={k}>
                              <td>{k}</td>
                              <td>
                                <input
                                  type="number"
                                  value={v}
                                  min={0}
                                  onChange={(e) =>
                                    setWeightages({ ...weightages, [k]: Number(e.target.value) })
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button className="apply-btn" onClick={applyWeightageEdit}>
                        Apply &amp; Recompute
                      </button>
                    </section>
                  )}

                  {/* Boundary editor */}
                  {editMode === "boundary" && (
                    <section className="card-section">
                      <h2 className="section-title">Grade Boundaries</h2>
                      <p className="edit-mode-note">
                        Set minimum marks for each grade. Grades will be
                        reassigned immediately on apply.
                      </p>
                      <table className="grade-table">
                        <tbody>
                          {gradeOrder.map((g) => (
                            <tr key={g}>
                              <td>{g}</td>
                              <td>
                                <input
                                  type="number"
                                  value={boundaries[g] ?? ""}
                                  min={0}
                                  onChange={(e) =>
                                    setBoundaries({ ...boundaries, [g]: Number(e.target.value) })
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button className="apply-btn" onClick={applyBoundaryEdit}>
                        Apply Boundaries
                      </button>
                    </section>
                  )}

                  {/* Stats strip */}
                  {stats && (
                    <section className="card-section">
                      <h2 className="section-title">Stats</h2>
                      <table className="grade-table">
                        <tbody>
                          <tr><td>Mean</td><td>{stats.mean ?? "-"}</td></tr>
                          <tr><td>Std Dev</td><td>{stats.sd ?? "-"}</td></tr>
                        </tbody>
                      </table>
                    </section>
                  )}
                </div>
              </div>

              {/* ══ BOTTOM — Student Detail Table ══ */}
              <section className="card-section" style={{ marginTop: "1.5rem" }}>
                <h2 className="section-title">Student Grades</h2>
                <div className="table-scroll">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>Total Marks</th>
                        <th>Auto Grade</th>
                        <th>Manual Grade</th>
                        <th>Adjust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? (
                        students.map((s, index) => (
                          <tr key={index}>
                            <td>{s.studentName}</td>
                            <td>{s.studentRollNo}</td>
                            <td>{s.totalMarks}</td>
                            <td className="auto-grade">{s.automatedGrade || "-"}</td>
                            <td className="manual-grade">
                              {s.manualGrade || s.automatedGrade || "-"}
                            </td>
                            <td className="adjust-btns">
                              <button onClick={() => changeGrade(index, "up")}>↑</button>
                              <button onClick={() => changeGrade(index, "down")}>↓</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6">No student data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}