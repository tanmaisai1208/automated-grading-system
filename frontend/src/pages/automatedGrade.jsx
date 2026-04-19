import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./automatedGrade.css";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const gradeOrder = ["AP", "AA", "AB", "BB", "BC", "CC", "CD", "DD", "FR"];

export default function AutomatedGrade() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const decodedCourseId = decodeURIComponent(courseId);

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [weightages, setWeightages] = useState({});
  const [maxMarks, setMaxMarks] = useState({});
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

  /* ── load config (weightages + maxMarks) ── */
  const fetchConfig = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/config/${encodeURIComponent(decodedCourseId)}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success && data.config) {
        if (Object.keys(data.config.weightages || {}).length > 0)
          setWeightages(data.config.weightages);
        if (Object.keys(data.config.totalMarks || {}).length > 0)
          setMaxMarks(data.config.totalMarks);
      }
    } catch (err) {
      console.error("Config fetch error:", err);
    }
  };

  /* ── initial compute — only if gradesComputed is false ── */
  const initialCompute = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/compute/${encodeURIComponent(decodedCourseId)}`,
        { method: "POST", credentials: "include" },
      );
      const data = await res.json();
      if (data.success && data.data) {
        setStudents(data.data.students || []);
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
  function GradeHistogram({ gradeOrder, countMap, boundaries }) {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      // Destroy previous instance before re-creating
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const counts = gradeOrder.map((g) => countMap[g] ?? 0);
      const maxCount = Math.max(...counts, 1);

      chartRef.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels: gradeOrder.map((g) =>
            boundaries?.[g] !== undefined ? `${g}\n(≥${boundaries[g]})` : g,
          ),
          datasets: [
            {
              label: "Students",
              data: counts,
              backgroundColor: counts.map((c) => {
                // colour by relative density
                const ratio = c / maxCount;
                if (ratio === 0) return "#D3D1C7";
                if (ratio < 0.33) return "#9FE1CB";
                if (ratio < 0.66) return "#1D9E75";
                return "#0F6E56";
              }),
              borderColor: "transparent",
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => {
                  const grade = gradeOrder[items[0].dataIndex];
                  const boundary = boundaries?.[grade];
                  return boundary !== undefined
                    ? `${grade}  —  min ${boundary} marks`
                    : grade;
                },
                label: (item) =>
                  ` ${item.raw} student${item.raw !== 1 ? "s" : ""}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#888780",
                font: { size: 12 },
              },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: "#888780",
                font: { size: 12 },
                precision: 0,
              },
              grid: {
                color: "rgba(136,135,128,0.15)",
              },
              border: { display: false },
            },
          },
        },
      });

      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [gradeOrder, countMap, boundaries]);

    return (
      <>
        {/* Custom legend */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {gradeOrder.map((g) => (
            <span
              key={g}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--color-text-secondary)",
              }}
            >
              <span
                style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
              >
                {g}
              </span>
              {boundaries?.[g] !== undefined && `≥ ${boundaries[g]}`}
              <span
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: "10px",
                  padding: "1px 8px",
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                }}
              >
                {countMap[g] ?? 0}
              </span>
            </span>
          ))}
        </div>

        {/* Chart */}
        <div style={{ position: "relative", width: "100%", height: "220px" }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Bar chart of grade distribution: ${gradeOrder.map((g) => `${g} ${countMap[g] ?? 0} students`).join(", ")}`}
          >
            {gradeOrder
              .map((g) => `${g}: ${countMap[g] ?? 0} students`)
              .join(", ")}
          </canvas>
        </div>
      </>
    );
  }

  /* ── fetch existing grades (when gradesComputed already true) ── */
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/${encodeURIComponent(decodedCourseId)}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success && data.data) {
        setStudents(data.data.students || []);
        setStats(data.data.stats || null);
        if (data.data.stats?.boundaries)
          setBoundaries({ ...data.data.stats.boundaries });
      }
    } catch (err) {
      console.error("Fetch grades error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── on mount: check flag then decide ── */
  useEffect(() => {
    if (!courseId) return;

    const init = async () => {
      await fetchConfig();

      // Check gradesComputed flag
      const res = await fetch(
        `http://localhost:5000/api/grading/${encodeURIComponent(decodedCourseId)}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.success && data.data?.gradesComputed === true) {
        // Already computed — just load, never call compute again
        setStudents(data.data.students || []);
        setStats(data.data.stats || null);
        if (data.data.stats?.boundaries)
          setBoundaries({ ...data.data.stats.boundaries });
        setLoading(false);
      } else {
        // First time — compute and lock
        await initialCompute();
      }
    };

    init();
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

  /* ── boundary change with cascade validation ── */
  const handleBoundaryChange = (grade, rawValue) => {
    setBoundaries((prev) => ({
      ...prev,
      [grade]: rawValue === "" ? "" : Number(rawValue),
    }));
  };

  /* ── apply boundary edit → manualGrade only ── */
  const applyBoundaryEdit = async () => {
    const order = ["AP", "AA", "AB", "BB", "BC", "CC", "CD", "DD"];

    // Clean empty strings to 0
    const cleanBoundaries = Object.fromEntries(
      Object.entries(boundaries).map(([k, v]) => [k, v === "" ? 0 : Number(v)]),
    );

    // Find all violations and report them specifically
    const violations = [];
    for (let i = 0; i < order.length - 1; i++) {
      if (cleanBoundaries[order[i]] < cleanBoundaries[order[i + 1]]) {
        violations.push(
          `${order[i]} (${cleanBoundaries[order[i]]}) must be ≥ ${order[i + 1]} (${cleanBoundaries[order[i + 1]]})`,
        );
      }
    }

    if (violations.length > 0) {
      alert(`Invalid grade boundaries:\n\n${violations.join("\n")}`);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/grading/boundary/${encodeURIComponent(decodedCourseId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ boundaries: cleanBoundaries }),
        },
      );

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to apply boundaries");
        return;
      }

      setStudents(
        (data.data.students || []).map((s) => ({
          ...s,
          manualGrade: s.manualGrade || s.automatedGrade,
        })),
      );
      setStats((prev) => ({
        ...prev,
        boundaries: data.data.stats?.boundaries || cleanBoundaries,
      }));
      setEditMode(null);
    } catch (err) {
      console.error("Boundary apply error:", err);
      alert("Failed to apply boundaries.");
    }
  };

  /* ── apply weightage edit → backend recomputes everything ── */
  const applyWeightageEdit = async () => {
    const weightTotal = Object.values(weightages).reduce(
      (a, b) => a + Number(b),
      0,
    );
    if (Math.round(weightTotal) !== 100) {
      alert(
        `Weightages must sum to 100. Current sum: ${weightTotal.toFixed(1)}`,
      );
      return;
    }

    try {
      const configRes = await fetch(
        `http://localhost:5000/api/grading/config/${encodeURIComponent(decodedCourseId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ weightages }),
        },
      );
      const configData = await configRes.json();
      if (!configData.success) {
        alert(configData.message || "Failed to save config");
        return;
      }

      // Fetch updated data — backend has new totalMarks, mean, sd, boundaries, manualGrades
      await fetchGrades();
      setEditMode(null);
    } catch (err) {
      console.error("Weightage apply error:", err);
      alert("Failed to apply weightage changes.");
    }
  };

  /* ── save manual grades and redirect ── */
  const saveChanges = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/grading/manual/${encodeURIComponent(decodedCourseId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ students }),
        },
      );
      navigate(`/statistical-analysis/${encodeURIComponent(decodedCourseId)}`);
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
        <div className="floating-actions">
          {/* No Recompute button — only Save */}
          <button
            className="compute-btn floating-btn save-btn"
            onClick={saveChanges}
          >
            Save Changes
          </button>
        </div>

        <div className="auto-grade-container">
          <h1 className="page-title">Computed Grades — {decodedCourseId}</h1>

          {loading ? (
            <p className="loading-text">Computing grades...</p>
          ) : (
            <>
              <div className="auto-layout">
                {/* LEFT — Grade Distribution */}
                <section className="card-section auto-left">
                  <h2 className="section-title">Grade Distribution</h2>
                  <GradeHistogram
                    gradeOrder={gradeOrder}
                    countMap={countMap}
                    boundaries={stats?.boundaries}
                  />
                </section>

                {/* RIGHT — Edit Panel */}
                <div className="auto-right">
                  {/* Mode selector */}
                  <section className="card-section">
                    <h2 className="section-title">Edit Mode</h2>
                    <p className="edit-mode-note">
                      Only one active at a time. All changes write to manual
                      grade only.
                    </p>
                    <div className="mode-btn-row">
                      <button
                        className={`mode-btn ${editMode === "weightage" ? "active" : ""}`}
                        onClick={() =>
                          setEditMode(
                            editMode === "weightage" ? null : "weightage",
                          )
                        }
                      >
                        Edit Weightages
                      </button>
                      <button
                        className={`mode-btn ${editMode === "boundary" ? "active" : ""}`}
                        onClick={() =>
                          setEditMode(
                            editMode === "boundary" ? null : "boundary",
                          )
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
                        Formula: (scored / max) × weight. Must sum to 100%.
                        Recomputes total marks, mean, SD, boundaries and manual
                        grades.
                      </p>
                      <table className="grade-table">
                        <thead>
                          <tr>
                            <th>Component</th>
                            <th>Max</th>
                            <th>Weight (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(weightages).map(([k, v]) => (
                            <tr key={k}>
                              <td>{k}</td>
                              <td
                                style={{
                                  color: "var(--color-text-secondary)",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {maxMarks[k] ?? "—"}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={v}
                                  min={0}
                                  max={100}
                                  onChange={(e) =>
                                    setWeightages({
                                      ...weightages,
                                      [k]: Number(e.target.value),
                                    })
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p
                        className="edit-mode-note"
                        style={{ marginTop: "0.5rem" }}
                      >
                        Total:{" "}
                        <strong
                          style={{
                            color:
                              Math.round(
                                Object.values(weightages).reduce(
                                  (a, b) => a + Number(b),
                                  0,
                                ),
                              ) === 100
                                ? "var(--color-text-success)"
                                : "var(--color-text-danger)",
                          }}
                        >
                          {Object.values(weightages).reduce(
                            (a, b) => a + Number(b),
                            0,
                          )}
                          %
                        </strong>
                      </p>
                      <button
                        className="apply-btn"
                        onClick={applyWeightageEdit}
                      >
                        Apply &amp; Recompute
                      </button>
                    </section>
                  )}

                  {/* Boundary editor */}
                  {editMode === "boundary" && (
                    <section className="card-section">
                      <h2 className="section-title">Grade Boundaries</h2>
                      <p className="edit-mode-note">
                        Set minimum marks per grade. Boundaries are validated
                        when you click Apply.
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
                                  step="0.01" // ← add this
                                  onChange={(e) =>
                                    handleBoundaryChange(g, e.target.value)
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
                  {/* Stats */}
                  {stats && (
                    <section className="card-section">
                      <h2 className="section-title">Stats</h2>
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
                        </tbody>
                      </table>
                    </section>
                  )}
                </div>
              </div>

              {/* BOTTOM — Student table */}
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
                            <td className="manual-grade">
                              {s.manualGrade || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">No student data</td>
                        </tr>
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
