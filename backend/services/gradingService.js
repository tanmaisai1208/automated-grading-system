const fs = require("fs");
const path = require("path");
const { COURSES_FILE } = require("../paths");

const coursesFile = COURSES_FILE;

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
    AA: Number((mean + 1.5 * sd).toFixed(2)),
    AB: Number((mean + 0.5 * sd).toFixed(2)),
    BB: Number((mean).toFixed(2)),
    BC: Number((mean - 0.5 * sd).toFixed(2)),
    CC: Number((mean - sd).toFixed(2)),
    CD: Number((mean - 1.5 * sd).toFixed(2)),
    DD: Number((mean - 2 * sd).toFixed(2)),
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
  return "FR";
}

function recomputeTotalMarks(students, weightages, maxMarks) {
  const keys = Object.keys(weightages);
  if (keys.length === 0) return students;

  return students.map((student) => {
    const total = keys.reduce((sum, key) => {
      const scored  = Number(student[key] || 0);
      const maxMark = Number(maxMarks[key] || 0);
      const weight  = Number(weightages[key] || 0);
      if (!maxMark) return sum + scored;
      return sum + (scored / maxMark) * weight;
    }, 0);

    return { ...student, totalMarks: Number(total.toFixed(2)) };
  });
}

/* ─── AP Grade assignment ─────────────────────────────────────────────────
   Returns { students, apCutoff } so callers can save AP boundary.
   apCutoff is null if AP was not awarded.
──────────────────────────────────────────────────────────────────────────── */
function assignAPGrade(students, gradeField) {
  const total       = students.length;
  const apCount     = Math.ceil(total * 0.02);   // top 2%, min 1
  const aaCount     = students.filter((s) => s[gradeField] === "AA").length;
  const aaThreshold = Math.ceil(total * 0.02);   // AA must be >= 2% of class

  // Not enough AA students — no AP awarded
  if (aaCount < aaThreshold) {
    return { students, apCutoff: null };
  }

  // Sort descending by totalMarks to find the cutoff mark for top 2%
  const sorted     = [...students].sort((a, b) => b.totalMarks - a.totalMarks);
  const cutoffMark = sorted[apCount - 1]?.totalMarks ?? Infinity;

  // Assign AP to everyone at or above the cutoff mark (handles ties)
  const updated = students.map((s) => ({
    ...s,
    [gradeField]: s.totalMarks >= cutoffMark ? "AP" : s[gradeField],
  }));

  return { students: updated, apCutoff: cutoffMark };
}

/* ─── Compute grades ─────────────────────────────────────────────────────── */
const computeGrades = async (courseId) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;

  if (course.gradesComputed === true) {
    return {
      students:       course.students || [],
      stats:          course.stats    || {},
      gradesComputed: true,
    };
  }

  const weightages = course.weightages || {};
  const maxMarks   = course.totalMarks  || {};
  let students     = course.students    || [];

  if (Object.keys(weightages).length > 0 && Object.keys(maxMarks).length > 0) {
    students = recomputeTotalMarks(students, weightages, maxMarks);
  }

  const marksArray = students.map((s) => s.totalMarks || 0);
  const mean       = calculateMean(marksArray);
  const sd         = calculateStdDev(marksArray, mean);
  const boundaries = getGradeBoundaries(mean, sd);

  // Assign AA/AB/BB... first
  students = students.map((student) => ({
    ...student,
    automatedGrade: getGrade(student.totalMarks || 0, boundaries),
    manualGrade:    getGrade(student.totalMarks || 0, boundaries),
  }));

  // Elevate top 2% to AP on automatedGrade and save cutoff
  const { students: autoAP, apCutoff: autoCutoff } =
    assignAPGrade(students, "automatedGrade");
  students = autoAP;

  // Elevate top 2% to AP on manualGrade
  const { students: manualAP, apCutoff: manualCutoff } =
    assignAPGrade(students, "manualGrade");
  students = manualAP;

  // Save AP boundary if awarded (cutoff is same for both fields)
  const apBoundary = autoCutoff ?? manualCutoff ?? null;
  if (apBoundary !== null) {
    boundaries.AP = apBoundary;
  }

  if (!course.stats) course.stats = {};
  course.stats.mean       = Number(mean.toFixed(2));
  course.stats.sd         = Number(sd.toFixed(2));
  course.stats.boundaries = boundaries; // includes AP if awarded
  course.gradesComputed   = true;
  course.students         = students;

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
    gradesComputed: course.gradesComputed || false,
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

/* ─── Set grading config ─────────────────────────────────────────────────── */
const setGradeConfig = async (courseId, config) => {
  const courses = readCourses();
  const index = courses.findIndex(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (index === -1) return null;

  if (config.weightages) {
    const total = Object.values(config.weightages).reduce(
      (a, b) => a + Number(b), 0
    );
    if (Math.round(total) !== 100) {
      return { error: `Weightages must sum to 100. Current sum: ${total.toFixed(1)}` };
    }

    courses[index].weightages = config.weightages;
    const maxMarks = courses[index].totalMarks || {};

    let studentsWithNewTotals = recomputeTotalMarks(
      courses[index].students || [],
      config.weightages,
      maxMarks
    );

    const marksArray = studentsWithNewTotals.map((s) => s.totalMarks || 0);
    const mean       = calculateMean(marksArray);
    const sd         = calculateStdDev(marksArray, mean);
    const boundaries = getGradeBoundaries(mean, sd);

    if (!courses[index].stats) courses[index].stats = {};
    courses[index].stats.mean = Number(mean.toFixed(2));
    courses[index].stats.sd   = Number(sd.toFixed(2));

    // Assign manualGrade first — automatedGrade untouched
    studentsWithNewTotals = studentsWithNewTotals.map((student) => ({
      ...student,
      manualGrade: getGrade(student.totalMarks, boundaries),
    }));

    // Elevate AP on manualGrade and save cutoff to boundaries
    const { students: withAP, apCutoff } =
      assignAPGrade(studentsWithNewTotals, "manualGrade");
    studentsWithNewTotals = withAP;

    if (apCutoff !== null) boundaries.AP = apCutoff;
    else delete boundaries.AP; // remove if AP no longer qualifies

    courses[index].stats.boundaries = boundaries;
    courses[index].students = studentsWithNewTotals;
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
    totalMarks:    course.totalMarks    || {},
    autoCutoffs:   course.autoCutoffs   || {},
    manualCutoffs: course.manualCutoffs || {},
  };
};

/* ─── Apply manual boundary edit ─────────────────────────────────────────── */
const applyBoundaryEdit = async (courseId, boundaries) => {
  const courses = readCourses();
  const index = courses.findIndex(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (index === -1) return null;

  // Validate descending order (skip AP — it's percentage-based, not boundary-based)
  const order = ["AA", "AB", "BB", "BC", "CC", "CD", "DD"];
  for (let i = 0; i < order.length - 1; i++) {
    if (boundaries[order[i]] < boundaries[order[i + 1]]) {
      return {
        error: `Invalid boundaries: ${order[i]} (${boundaries[order[i]]}) must be ≥ ${order[i + 1]} (${boundaries[order[i + 1]]})`,
      };
    }
  }

  if (!courses[index].stats) courses[index].stats = {};

  // Assign manualGrade from new boundaries — automatedGrade untouched
  let updatedStudents = (courses[index].students || []).map((student) => ({
    ...student,
    manualGrade: getGrade(student.totalMarks || 0, boundaries),
  }));

  // Elevate AP on manualGrade and save cutoff to boundaries
  const { students: withAP, apCutoff } =
    assignAPGrade(updatedStudents, "manualGrade");
  updatedStudents = withAP;

  if (apCutoff !== null) boundaries.AP = apCutoff;
  else delete boundaries.AP; // remove if AP no longer qualifies

  courses[index].stats.boundaries = boundaries;
  courses[index].students = updatedStudents;

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
  applyBoundaryEdit,
};