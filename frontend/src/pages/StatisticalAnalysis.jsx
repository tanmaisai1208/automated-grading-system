import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./StatisticalAnalysis.css";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Bar, Line, Pie } from "react-chartjs-2";

// AP added at top, colors extended
const gradeColors = [
  "#a855f7", // AP - purple
  "#22c55e", // AA - green
  "#3b82f6", // AB - blue
  "#6366f1", // BB - indigo
  "#f59e0b", // BC - amber
  "#f97316", // CC - orange
  "#ef4444", // CD - red
  "#991b1b", // DD - dark red
  "#475569", // FR - slate
];

const COLORS = {
  blue: "#3b82f6",
  blueDark: "#2563eb",
  violet: "#7c3aed",
  teal: "#14b8a6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  slate: "#64748b",
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function stdDev(arr) {
  if (!arr.length) return 0;
  const m = mean(arr);
  const v = arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(v);
}

function quantile(arr, q) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return s[base + 1] !== undefined
    ? s[base] + rest * (s[base + 1] - s[base])
    : s[base];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalPdf(x, mu, sigma) {
  if (sigma === 0) return 0;
  const a = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const e = Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
  return a * e;
}

// AP at top, FR instead of F at bottom
const GRADE_LIST = ["AP", "AA", "AB", "BB", "BC", "CC", "CD", "DD", "FR"];

const StatisticalAnalysis = () => {
  const { courseId } = useParams();

  const [dataRows, setDataRows] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `/api/courses/${courseId}`,
          { credentials: "include" }
        );
        const data = await res.json();

        const raw = data.course?.students || data.students || [];

        setStudents(raw);

        const rows = raw.map((s) => ({
          total: s.totalMarks || 0,
          // Normalise legacy "F" → "FR" on the way in
          gradeAuto: s.automatedGrade === "F" ? "FR" : s.automatedGrade || "",
          gradeManual: s.manualGrade === "F" ? "FR" : s.manualGrade || "",
          mid: s.midsem || 0,
          end: s.endsem || 0,
          quiz: s.quiz || 0,
          assignment: s.assignment || 0,
        }));

        setDataRows(rows);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [courseId]);

  const totals = useMemo(() => dataRows.map((r) => r.total), [dataRows]);

  const stats = useMemo(() => {
    const n = totals.length;
    const min = n ? Math.min(...totals) : 0;
    const max = n ? Math.max(...totals) : 0;
    const avg = mean(totals);
    const med = median(totals);
    const sd = stdDev(totals);
    const q1 = quantile(totals, 0.25);
    const q3 = quantile(totals, 0.75);
    const passCount = totals.filter((x) => x >= 40).length;
    const passPct = n ? (passCount / n) * 100 : 0;

    return { n, min, max, avg, med, sd, q1, q3, passPct };
  }, [totals]);

  const histogram = useMemo(() => {
    const binSize = 10;
    const bins = Array.from({ length: 10 }, (_, i) => ({
      label: `${i * binSize}-${i * binSize + (binSize - 1)}`,
      count: 0,
      mid: i * binSize + binSize / 2,
    }));

    totals.forEach((x) => {
      const idx = clamp(Math.floor(x / binSize), 0, 9);
      bins[idx].count += 1;
    });

    return bins;
  }, [totals]);

  const gaussianSeries = useMemo(() => {
    const { avg, sd } = stats;
    const pdf = histogram.map((b) => normalPdf(b.mid, avg, sd));
    const maxCount = Math.max(...histogram.map((b) => b.count), 1);
    const maxPdf = Math.max(...pdf, 1e-9);
    return pdf.map((p) => (p / maxPdf) * maxCount);
  }, [histogram, stats]);

  // Grade distribution using full GRADE_LIST (AP + AA..DD + FR)
  const gradeDist = useMemo(() => {
    const auto = Object.fromEntries(GRADE_LIST.map((g) => [g, 0]));
    const manual = Object.fromEntries(GRADE_LIST.map((g) => [g, 0]));

    dataRows.forEach((r) => {
      if (auto[r.gradeAuto] !== undefined) auto[r.gradeAuto]++;
      if (manual[r.gradeManual] !== undefined) manual[r.gradeManual]++;
    });

    return { auto, manual };
  }, [dataRows]);

  const componentAverages = useMemo(() => {
    const n = dataRows.length || 1;
    const sum = dataRows.reduce(
      (acc, r) => ({
        mid: acc.mid + r.mid,
        end: acc.end + r.end,
        quiz: acc.quiz + r.quiz,
        assignment: acc.assignment + r.assignment,
      }),
      { mid: 0, end: 0, quiz: 0, assignment: 0 },
    );

    return {
      labels: ["Mid-Sem", "End-Sem", "Quizzes", "Assignments"],
      values: [sum.mid / n, sum.end / n, sum.quiz / n, sum.assignment / n],
    };
  }, [dataRows]);

  /* ── Excel download ── */
  const downloadExcel = () => {
    if (!students.length) return;

    const reserved = new Set([
      "sno",
      "studentName",
      "studentRollNo",
      "totalMarks",
      "automatedGrade",
      "manualGrade",
    ]);

    const studentSheet = students.map((s) => {
      const componentKeys = Object.keys(s).filter(
        (k) => !reserved.has(k) && typeof s[k] === "number",
      );
      return {
        Name: s.studentName,
        "Roll No": s.studentRollNo,
        ...Object.fromEntries(componentKeys.map((k) => [k, s[k]])),
        "Total Marks": s.totalMarks,
        "Auto Grade": s.automatedGrade === "F" ? "FR" : s.automatedGrade,
        "Manual Grade": s.manualGrade === "F" ? "FR" : s.manualGrade,
      };
    });

    const statsSheet = [
      { Metric: "Total Students", Value: stats.n },
      { Metric: "Min", Value: stats.min },
      { Metric: "Max", Value: stats.max },
      { Metric: "Mean", Value: stats.avg.toFixed(2) },
      { Metric: "Median", Value: stats.med.toFixed(2) },
      { Metric: "Std Deviation", Value: stats.sd.toFixed(2) },
      { Metric: "Q1", Value: stats.q1.toFixed(2) },
      { Metric: "Q3", Value: stats.q3.toFixed(2) },
      { Metric: "Pass %", Value: stats.passPct.toFixed(1) + "%" },
      {},
      { Metric: "Auto Grade Distribution", Value: "" },
      ...GRADE_LIST.map((g) => ({
        Metric: `  ${g}`,
        Value: gradeDist.auto[g],
      })),
      {},
      { Metric: "Manual Grade Distribution", Value: "" },
      ...GRADE_LIST.map((g) => ({
        Metric: `  ${g}`,
        Value: gradeDist.manual[g],
      })),
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(studentSheet);
    const ws2 = XLSX.utils.json_to_sheet(statsSheet);

    // ── Auto-fit column widths for Students sheet ──
    // Calculate max character length per column across header + all rows
    const studentRows = [
      Object.keys(studentSheet[0] || {}), // header row
      ...studentSheet.map((r) => Object.values(r)), // data rows
    ];

    const studentColWidths = studentRows[0].map((_, colIdx) => {
      const maxLen = studentRows.reduce((max, row) => {
        const cell = row[colIdx];
        const len =
          cell !== null && cell !== undefined ? String(cell).length : 0;
        return Math.max(max, len);
      }, 0);
      return { wch: maxLen + 4 }; // +4 for padding
    });

    ws1["!cols"] = studentColWidths;

    // ── Auto-fit column widths for Statistics sheet ──
    const statsRows = [
      ["Metric", "Value"], // header
      ...statsSheet.map((r) => [r.Metric ?? "", r.Value ?? ""]),
    ];

    const statsColWidths = [0, 1].map((colIdx) => {
      const maxLen = statsRows.reduce((max, row) => {
        const cell = row[colIdx];
        const len =
          cell !== null && cell !== undefined ? String(cell).length : 0;
        return Math.max(max, len);
      }, 0);
      return { wch: maxLen + 4 };
    });

    ws2["!cols"] = statsColWidths;

    XLSX.utils.book_append_sheet(wb, ws1, "Students");
    XLSX.utils.book_append_sheet(wb, ws2, "Statistics");
    XLSX.writeFile(wb, `${decodeURIComponent(courseId)}_grades.xlsx`);
  };

  /* ── Chart data ── */
  const histogramChart = {
    labels: histogram.map((b) => b.label),
    datasets: [
      {
        type: "bar",
        label: "Students (count)",
        data: histogram.map((b) => b.count),
        backgroundColor: COLORS.blue,
        borderColor: COLORS.blueDark,
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: COLORS.violet,
      },
    ],
  };

  const gaussianChart = {
    labels: histogram.map((b) => b.label),
    datasets: [
      {
        type: "bar",
        label: "Histogram (count)",
        data: histogram.map((b) => b.count),
        backgroundColor: "rgba(59,130,246,0.35)",
        borderRadius: 8,
      },
      {
        type: "line",
        label: "Gaussian curve",
        data: gaussianSeries,
        borderColor: COLORS.amber,
        backgroundColor: "rgba(245,158,11,0.25)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: COLORS.amber,
        pointBorderColor: "#fff",
      },
    ],
  };

  const gradePieAuto = {
    labels: GRADE_LIST,
    datasets: [
      {
        label: "Auto Grades",
        data: GRADE_LIST.map((g) => gradeDist.auto[g]),
        backgroundColor: gradeColors,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const gradePieManual = {
    labels: GRADE_LIST,
    datasets: [
      {
        label: "Manual Grades",
        data: GRADE_LIST.map((g) => gradeDist.manual[g]),
        backgroundColor: gradeColors,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const componentBar = {
    labels: componentAverages.labels,
    datasets: [
      {
        label: "Average marks contribution",
        data: componentAverages.values.map((v) => Number(v.toFixed(2))),
        backgroundColor: [
          COLORS.blue,
          COLORS.violet,
          COLORS.teal,
          COLORS.green,
        ],
        borderRadius: 10,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    plugins: { legend: { position: "top" }, tooltip: { enabled: true } },
  };
  const lineOptions = {
    ...commonOptions,
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };
  const barOptions = {
    ...commonOptions,
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  return (
    <div className="analysis-wrapper">
      <Navbar />

      <main className="analysis-main">
        <div className="analysis-container">
          <header className="analysis-header">
            <div className="analysis-badge">Statistical Insights</div>
            <h1 className="analysis-title">
              Performance Analytics{" "}
              <span className="analysis-course">{courseId}</span>
            </h1>
            <p className="analysis-subtitle">
              Visual and statistical overview of class performance (no
              individual student table shown here).
            </p>

            {/* Download button */}
            <button className="download-excel-btn" onClick={downloadExcel}>
              Download Results (Excel)
            </button>
          </header>

          {/* KPI Cards — unchanged */}
          <section className="kpi-grid">
            <div className="kpi-card">
              <p className="kpi-label">Students</p>
              <p className="kpi-value">{stats.n}</p>
              <p className="kpi-meta">Total strength</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Min / Max</p>
              <p className="kpi-value">
                {stats.min} / {stats.max}
              </p>
              <p className="kpi-meta">Range of scores</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Mean</p>
              <p className="kpi-value">{stats.avg.toFixed(2)}</p>
              <p className="kpi-meta">Average marks</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Median</p>
              <p className="kpi-value">{stats.med.toFixed(2)}</p>
              <p className="kpi-meta">Middle score</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Std Deviation</p>
              <p className="kpi-value">{stats.sd.toFixed(2)}</p>
              <p className="kpi-meta">Spread (σ)</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Q1 / Q3</p>
              <p className="kpi-value">
                {stats.q1.toFixed(2)} / {stats.q3.toFixed(2)}
              </p>
              <p className="kpi-meta">Quartiles</p>
            </div>
            <div className="kpi-card kpi-highlight">
              <p className="kpi-label">Pass %</p>
              <p className="kpi-value">{stats.passPct.toFixed(1)}%</p>
              <p className="kpi-meta">Threshold: 40</p>
            </div>
          </section>

          {/* Charts Grid — unchanged layout */}
          <section className="charts-grid">
            <div className="chart-card">
              <div className="chart-head">
                <h3>Marks Histogram</h3>
                <p>Distribution of total marks (0–100) in bins of 10.</p>
              </div>
              <Bar data={histogramChart} options={barOptions} />
            </div>

            <div className="chart-card">
              <div className="chart-head">
                <h3>Gaussian Curve Overlay</h3>
                <p>
                  Normal curve fitted using mean and standard deviation (scaled
                  to counts).
                </p>
              </div>
              <Line data={gaussianChart} options={lineOptions} />
            </div>

            <div className="chart-card">
              <div className="chart-head">
                <h3>Grade Distribution (Automated)</h3>
                <p>Share of students in each grade (auto computed).</p>
              </div>
              <Pie data={gradePieAuto} options={commonOptions} />
            </div>

            <div className="chart-card">
              <div className="chart-head">
                <h3>Grade Distribution (Manual)</h3>
                <p>Share of students in each grade (professor cutoffs).</p>
              </div>
              <Pie data={gradePieManual} options={commonOptions} />
            </div>

            <div className="chart-card chart-wide">
              <div className="chart-head">
                <h3>Component Contribution</h3>
                <p>
                  Average marks contribution by evaluation components (helps
                  diagnose weak areas).
                </p>
              </div>
              <Bar data={componentBar} options={barOptions} />
            </div>
          </section>

          {/* Insight Panel — unchanged */}
          <section className="insight-panel">
            <div className="insight-card">
              <h3>Quick Interpretation</h3>
              <ul>
                <li>
                  <strong>Spread:</strong> Higher σ means marks are more
                  dispersed; lower σ means students are clustered.
                </li>
                <li>
                  <strong>Mean vs Median:</strong> If mean ≫ median, a few high
                  scores may be pulling the average up (and vice versa).
                </li>
                <li>
                  <strong>Quartiles:</strong> Q1–Q3 shows where the middle 50%
                  of students lie.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StatisticalAnalysis;
