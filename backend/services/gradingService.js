const fs = require("fs");
const path = require("path");

const coursesFile = path.join(__dirname, "../data/courses.json");

function readCourses() {
  return JSON.parse(fs.readFileSync(coursesFile, "utf8"));
}

function writeCourses(data) {
  fs.writeFileSync(coursesFile, JSON.stringify(data, null, 2));
}

function calculateMean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateStdDev(arr, mean) {
  const variance =
    arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function getGradeBoundaries(mean, sd) {
  return {
    AA: Math.round(mean + 1.5 * sd),
    AB: Math.round(mean + 0.5 * sd),
    BB: Math.round(mean),
    BC: Math.round(mean - 0.5 * sd),
    CC: Math.round(mean - sd),
    CD: Math.round(mean - 1.5 * sd),
    DD: Math.round(mean - 2 * sd),
  };
}

function getGrade(marks, boundaries) {
  if (marks >= boundaries.AA) return "AA";
  if (marks >= boundaries.AB) return "AB";
  if (marks >= boundaries.BB) return "BB";
  if (marks >= boundaries.BC) return "BC";
  if (marks >= boundaries.CC) return "CC";
  if (marks >= boundaries.CD) return "CD";
  if (marks >= boundaries.DD) return "DD";
  return "F";
}

/*
  Formula: (studentMark / maxMark) * weightage
  weightages = { quiz: 30, midsem: 40, ... }  ← percentages, must sum to 100
  maxMarks   = { quiz: 10, midsem: 30, ... }  ← stored as course.totalMarks in JSON
*/
function recomputeTotalMarks(students, weightages, maxMarks) {
  const keys = Object.keys(weightages);
  if (keys.length === 0) return students;

  return students.map((student) => {
    const total = keys.reduce((sum, key) => {
      const scored  = Number(student[key] || 0);
      const maxMark = Number(maxMarks[key] || 0);
      const weight  = Number(weightages[key] || 0);

      if (!maxMark) return sum + scored; // fallback if maxMark missing
      return sum + (scored / maxMark) * weight;
    }, 0);

    return { ...student, totalMarks: Number(total.toFixed(2)) };
  });
}

/* ─── Compute grades ───────────────────────────────────────────────────────
   Only runs if course.gradesComputed is false/missing.
   Sets automatedGrade AND manualGrade (initial seed) then locks with flag.
──────────────────────────────────────────────────────────────────────────── */
const computeGrades = async (courseId) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;

  // ── GUARD: already computed, return existing data as-is ──
  if (course.gradesComputed === true) {
    return {
      students:       course.students || [],
      stats:          course.stats    || {},
      gradesComputed: true,
    };
  }

  // ── STEP 1: Recompute totalMarks from raw component marks ──
  // Always do this before grading so uploaded raw marks are the source of truth
  const weightages = course.weightages || {};
  const maxMarks   = course.totalMarks  || {};

  let students = course.students || [];

  if (Object.keys(weightages).length > 0 && Object.keys(maxMarks).length > 0) {
    students = recomputeTotalMarks(students, weightages, maxMarks);
  }

  // ── STEP 2: Compute mean, SD, boundaries from fresh totalMarks ──
  const marksArray = students.map((s) => s.totalMarks || 0);
  const mean       = calculateMean(marksArray);
  const sd         = calculateStdDev(marksArray, mean);
  const boundaries = getGradeBoundaries(mean, sd);

  // ── STEP 3: Assign automatedGrade AND seed manualGrade ──
  course.students = students.map((student) => ({
    ...student,
    automatedGrade: getGrade(student.totalMarks || 0, boundaries),
    manualGrade:    getGrade(student.totalMarks || 0, boundaries),
  }));

  // ── STEP 4: Save stats and lock the flag ──
  if (!course.stats) course.stats = {};
  course.stats.mean       = Number(mean.toFixed(2));
  course.stats.sd         = Number(sd.toFixed(2));
  course.stats.boundaries = boundaries;
  course.gradesComputed   = true;

  writeCourses(courses);

  return {
    students:       course.students,
    stats:          course.stats,
    gradesComputed: true,
  };
};

/* ─── Get grades ─────────────────────────────────────────────────────────── */
const getGradesByCourse = async (courseId) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;
  return {
    students:       course.students       || [],
    stats:          course.stats          || {},
    gradesComputed: course.gradesComputed || false, // ← frontend checks this
  };
};

/* ─── Save manual grades ─────────────────────────────────────────────────── */
const saveManualGrades = async (courseId, students) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;

  const gradeMap = {};
  students.forEach((s) => { gradeMap[s.studentRollNo] = s.manualGrade; });

  course.students.forEach((student) => {
    if (gradeMap[student.studentRollNo] !== undefined) {
      student.manualGrade = gradeMap[student.studentRollNo];
    }
  });

  writeCourses(courses);
  return course.students;
};

/* ─── Set grading config ─────────────────────────────────────────────────
   Weightage edit:
     1. Validates sum === 100
     2. Recomputes totalMarks using (scored/maxMark)*weight
     3. Reassigns manualGrade from new totals using EXISTING boundaries
     4. NEVER touches automatedGrade
──────────────────────────────────────────────────────────────────────────── */
const setGradeConfig = async (courseId, config) => {
  const courses = readCourses();
  const index = courses.findIndex(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (index === -1) return null;

  if (config.weightages) {
    // Validate sum = 100
    const total = Object.values(config.weightages).reduce(
      (a, b) => a + Number(b), 0
    );
    if (Math.round(total) !== 100) {
      return { error: `Weightages must sum to 100. Current sum: ${total.toFixed(1)}` };
    }

    courses[index].weightages = config.weightages;
    const maxMarks = courses[index].totalMarks || {};

    // 1. Recompute totalMarks for every student
    const studentsWithNewTotals = recomputeTotalMarks(
      courses[index].students || [],
      config.weightages,
      maxMarks
    );

    // 2. Recompute mean, sd, boundaries from new totalMarks
    const marksArray = studentsWithNewTotals.map((s) => s.totalMarks || 0);
    const mean = calculateMean(marksArray);
    const sd   = calculateStdDev(marksArray, mean);
    const boundaries = getGradeBoundaries(mean, sd);

    // 3. Update stats
    if (!courses[index].stats) courses[index].stats = {};
    courses[index].stats.mean       = Number(mean.toFixed(2));
    courses[index].stats.sd         = Number(sd.toFixed(2));
    courses[index].stats.boundaries = boundaries;

    // 4. Assign manualGrade from new boundaries — automatedGrade untouched
    courses[index].students = studentsWithNewTotals.map((student) => ({
      ...student,
      manualGrade: getGrade(student.totalMarks, boundaries),
    }));
  }

  if (config.autoCutoffs)   courses[index].autoCutoffs   = config.autoCutoffs;
  if (config.manualCutoffs) courses[index].manualCutoffs = config.manualCutoffs;

  writeCourses(courses);
  return { success: true, course: courses[index] };
};

/* ─── Get grading config ─────────────────────────────────────────────────── */
const getGradeConfig = async (courseId) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;
  return {
    weightages:    course.weightages    || {},
    totalMarks:    course.totalMarks    || {}, // max marks per component
    autoCutoffs:   course.autoCutoffs   || {},
    manualCutoffs: course.manualCutoffs || {},
  };
};

/* ─── Apply manual boundary edit ────────────────────────────────────────────
   Saves new boundaries to stats.boundaries and reassigns manualGrade.
   automatedGrade is never touched.
──────────────────────────────────────────────────────────────────────────── */
const applyBoundaryEdit = async (courseId, boundaries) => {
  const courses = readCourses();
  const index = courses.findIndex(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (index === -1) return null;

  // Validate boundaries are strictly descending
  const order = ["AA", "AB", "BB", "BC", "CC", "CD", "DD"];
  for (let i = 0; i < order.length - 1; i++) {
    if (boundaries[order[i]] < boundaries[order[i + 1]]) {
      return {
        error: `Invalid boundaries: ${order[i]} (${boundaries[order[i]]}) must be ≥ ${order[i + 1]} (${boundaries[order[i + 1]]})`,
      };
    }
  }

  // Save new boundaries
  if (!courses[index].stats) courses[index].stats = {};
  courses[index].stats.boundaries = boundaries;

  // Reassign manualGrade from new boundaries — automatedGrade untouched
  courses[index].students = (courses[index].students || []).map((student) => ({
    ...student,
    manualGrade: getGrade(student.totalMarks || 0, boundaries),
  }));

  writeCourses(courses);

  return {
    students: courses[index].students,
    stats:    courses[index].stats,
  };
};

module.exports = {
  computeGrades,
  getGradesByCourse,
  saveManualGrades,
  setGradeConfig,
  getGradeConfig,
  applyBoundaryEdit,   // ← export
};