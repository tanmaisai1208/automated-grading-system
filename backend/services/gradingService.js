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

/* ─── AP Grade assignment ────────────────────────────────────────────────────
   Rules:
   1. Count how many students got AA.
   2. AA count must be >= 2% of total class — otherwise no AP awarded.
   3. Top 2% of the ENTIRE class (by totalMarks) get AP, replacing their grade.
   4. "top 2%" is always at least 1 student (Math.ceil), but only if rule 2 passes.
   5. Ties at the cutoff mark all get AP.

   Operates on the gradeField passed in — so it works for both
   automatedGrade (initial compute) and manualGrade (subsequent edits).
──────────────────────────────────────────────────────────────────────────── */
function assignAPGrade(students, gradeField) {
  const total      = students.length;
  const apCount    = Math.ceil(total * 0.02);   // top 2%, min 1
  const aaCount    = students.filter((s) => s[gradeField] === "AA").length;
  const aaThreshold = Math.ceil(total * 0.02);  // AA must be >= 2% of class

  // Not enough AA students — no AP awarded
  if (aaCount < aaThreshold) return students;

  // Sort descending by totalMarks to find the cutoff mark for top 2%
  const sorted     = [...students].sort((a, b) => b.totalMarks - a.totalMarks);
  const cutoffMark = sorted[apCount - 1]?.totalMarks ?? Infinity;

  // Assign AP to everyone at or above the cutoff mark (handles ties)
  return students.map((s) => ({
    ...s,
    [gradeField]: s.totalMarks >= cutoffMark ? "AP" : s[gradeField],
  }));
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

  // Then elevate top 2% to AP on both fields
  students = assignAPGrade(students, "automatedGrade");
  students = assignAPGrade(students, "manualGrade");

  if (!course.stats) course.stats = {};
  course.stats.mean       = Number(mean.toFixed(2));
  course.stats.sd         = Number(sd.toFixed(2));
  course.stats.boundaries = boundaries;
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
    courses[index].stats.mean       = Number(mean.toFixed(2));
    courses[index].stats.sd         = Number(sd.toFixed(2));
    courses[index].stats.boundaries = boundaries;

    // Assign manualGrade then elevate AP — automatedGrade untouched
    studentsWithNewTotals = studentsWithNewTotals.map((student) => ({
      ...student,
      manualGrade: getGrade(student.totalMarks, boundaries),
    }));
    studentsWithNewTotals = assignAPGrade(studentsWithNewTotals, "manualGrade");

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

  const order = ["AP", "AA", "AB", "BB", "BC", "CC", "CD", "DD"];
  for (let i = 0; i < order.length - 1; i++) {
    if (boundaries[order[i]] < boundaries[order[i + 1]]) {
      return {
        error: `Invalid boundaries: ${order[i]} (${boundaries[order[i]]}) must be ≥ ${order[i + 1]} (${boundaries[order[i + 1]]})`,
      };
    }
  }

  if (!courses[index].stats) courses[index].stats = {};
  courses[index].stats.boundaries = boundaries;

  // Assign manualGrade from new boundaries then elevate AP
  let updatedStudents = (courses[index].students || []).map((student) => ({
    ...student,
    manualGrade: getGrade(student.totalMarks || 0, boundaries),
  }));
  updatedStudents = assignAPGrade(updatedStudents, "manualGrade");

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