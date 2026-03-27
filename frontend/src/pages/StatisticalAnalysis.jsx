import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "./StatisticalAnalysis.css";
import { useState, useEffect } from "react";

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

const gradeColors = [
  "#22c55e", // AA - green
  "#3b82f6", // AB - blue
  "#6366f1", // BB - indigo
  "#f59e0b", // BC - amber
  "#f97316", // CC - orange
  "#ef4444", // CD - red
  "#991b1b", // DD - dark red
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
  Filler
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
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const v = arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(v);
}

function quantile(arr, q) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base];
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

const StatisticalAnalysis = () => {
  const { courseId } = useParams();

 
const [dataRows, setDataRows] = useState([]);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/${courseId}`
      );

      const data = await res.json();

      const students =
        data.course?.students ||
        data.students ||
        [];

      const rows = students.map((s) => ({
        total: s.totalMarks || 0,
        gradeAuto: s.automatedGrade || "",
        gradeManual: s.manualGrade || "",
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

    // Example: pass threshold at 40 (you can change)
    const passCount = totals.filter((x) => x >= 40).length;
    const passPct = n ? (passCount / n) * 100 : 0;

    return { n, min, max, avg, med, sd, q1, q3, passPct };
  }, [totals]);

  // Histogram bins (0-100, step 10)
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

  // Gaussian curve values aligned to histogram x
  const gaussianSeries = useMemo(() => {
    const { avg, sd } = stats;
    const pdf = histogram.map((b) => normalPdf(b.mid, avg, sd));

    // Scale pdf to histogram counts so it overlays nicely:
    const maxCount = Math.max(...histogram.map((b) => b.count), 1);
    const maxPdf = Math.max(...pdf, 1e-9);
    const scaled = pdf.map((p) => (p / maxPdf) * maxCount);

    return scaled;
  }, [histogram, stats]);

  // Grade distributions
  const gradeDist = useMemo(() => {
    const grades = ["AA", "AB", "BB", "BC", "CC", "CD", "DD"];
    const auto = Object.fromEntries(grades.map((g) => [g, 0]));
    const manual = Object.fromEntries(grades.map((g) => [g, 0]));

    dataRows.forEach((r) => {
      if (auto[r.gradeAuto] !== undefined) auto[r.gradeAuto] += 1;
      if (manual[r.gradeManual] !== undefined) manual[r.gradeManual] += 1;
    });

    return { grades, auto, manual };
  }, [dataRows]);

  // Component averages (insightful for professor)
  const componentAverages = useMemo(() => {
    const n = dataRows.length || 1;
    const sum = dataRows.reduce(
      (acc, r) => ({
        mid: acc.mid + r.mid,
        end: acc.end + r.end,
        quiz: acc.quiz + r.quiz,
        assignment: acc.assignment + r.assignment,
      }),
      { mid: 0, end: 0, quiz: 0, assignment: 0 }
    );

    return {
      labels: ["Mid-Sem", "End-Sem", "Quizzes", "Assignments"],
      values: [sum.mid / n, sum.end / n, sum.quiz / n, sum.assignment / n],
    };
  }, [dataRows]);

const histogramChart = {
  labels: histogram.map(b => b.label),
  datasets: [
    {
      type: "bar",
      label: "Students (count)",
      data: histogram.map(b => b.count),
      backgroundColor: COLORS.blue,
      borderColor: COLORS.blueDark,
      borderWidth: 1,
      borderRadius: 8,
      hoverBackgroundColor: COLORS.violet,
    },
  ],
};

const gaussianChart = {
  labels: histogram.map(b => b.label),
  datasets: [
    {
      type: "bar",
      label: "Histogram (count)",
      data: histogram.map(b => b.count),
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
  labels: gradeDist.grades,
  datasets: [
    {
      label: "Auto Grades",
      data: gradeDist.grades.map(g => gradeDist.auto[g]),
      backgroundColor: gradeColors,
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  ],
};

const gradePieManual = {
  labels: gradeDist.grades,
  datasets: [
    {
      label: "Manual Grades",
      data: gradeDist.grades.map(g => gradeDist.manual[g]),
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
      data: componentAverages.values.map(v => Number(v.toFixed(2))),
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
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="analysis-wrapper">
      <Navbar />

      <main className="analysis-main">
        <div className="analysis-container">
          <header className="analysis-header">
            <div className="analysis-badge">📈 Statistical Insights</div>
            <h1 className="analysis-title">
              Performance Analytics <span className="analysis-course">{courseid}</span>
            </h1>
            <p className="analysis-subtitle">
              Visual and statistical overview of class performance (no individual student table shown here).
            </p>
          </header>

          {/* KPI Cards */}
          <section className="kpi-grid">
            <div className="kpi-card">
              <p className="kpi-label">Students</p>
              <p className="kpi-value">{stats.n}</p>
              <p className="kpi-meta">Total strength</p>
            </div>

            <div className="kpi-card">
              <p className="kpi-label">Min / Max</p>
              <p className="kpi-value">{stats.min} / {stats.max}</p>
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
              <p className="kpi-value">{stats.q1.toFixed(2)} / {stats.q3.toFixed(2)}</p>
              <p className="kpi-meta">Quartiles</p>
            </div>

            <div className="kpi-card kpi-highlight">
              <p className="kpi-label">Pass %</p>
              <p className="kpi-value">{stats.passPct.toFixed(1)}%</p>
              <p className="kpi-meta">Threshold: 40</p>
            </div>
          </section>

          {/* Charts Grid */}
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
                <p>Normal curve fitted using mean and standard deviation (scaled to counts).</p>
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
                <p>Average marks contribution by evaluation components (helps diagnose weak areas).</p>
              </div>
              <Bar data={componentBar} options={barOptions} />
            </div>
          </section>

          {/* Insight Panel */}
          <section className="insight-panel">
            <div className="insight-card">
              <h3>Quick Interpretation</h3>
              <ul>
                <li>
                  <strong>Spread:</strong> Higher σ means marks are more dispersed; lower σ means students are clustered.
                </li>
                <li>
                  <strong>Mean vs Median:</strong> If mean ≫ median, a few high scores may be pulling the average up (and vice versa).
                </li>
                <li>
                  <strong>Quartiles:</strong> Q1–Q3 shows where the middle 50% of students lie.
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
