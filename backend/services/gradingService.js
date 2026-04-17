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

/* ─── reusable: recalculate totalMarks from component marks ─── */
function recomputeTotalMarks(students, weightages) {
  const keys = Object.keys(weightages);
  if (keys.length === 0) return students;

  return students.map((student) => {
    const total = keys.reduce(
      (sum, key) => sum + Number(student[key] || 0),
      0
    );
    return { ...student, totalMarks: Number(total.toFixed(2)) };
  });
}

/* ─── Compute grades ─── */
const computeGrades = async (courseId) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;

  // Always re-sum from components if weightages are defined
  if (course.weightages && Object.keys(course.weightages).length > 0) {
    course.students = recomputeTotalMarks(
      course.students || [],
      course.weightages
    );
  }

  const students = course.students || [];
  const marksArray = students.map((s) => s.totalMarks || 0);

  const mean = calculateMean(marksArray);
  const sd = calculateStdDev(marksArray, mean);
  const boundaries = getGradeBoundaries(mean, sd);

  course.students = students.map((student) => ({
    ...student,
    automatedGrade: getGrade(student.totalMarks || 0, boundaries),
  }));

  if (!course.stats) course.stats = {};
  course.stats.mean = Number(mean.toFixed(2));
  course.stats.sd = Number(sd.toFixed(2));
  course.stats.boundaries = boundaries;

  writeCourses(courses);

  return { students: course.students, stats: course.stats };
};

/* ─── Get grades ─── */
const getGradesByCourse = async (courseId) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;
  return { students: course.students || [], stats: course.stats || {} };
};

/* ─── Save manual grades ─── */
const saveManualGrades = async (courseId, students) => {
  const courses = readCourses();
  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (!course) return null;

  const gradeMap = {};
  students.forEach((s) => { gradeMap[s.studentRollNo] = s.manualGrade; });

  course.students.forEach((student) => {
    if (gradeMap[student.studentRollNo]) {
      student.manualGrade = gradeMap[student.studentRollNo];
    }
  });

  writeCourses(courses);
  return course.students;
};

/* ─── Set grading config ─── */
const setGradeConfig = async (courseId, config) => {
  const courses = readCourses();
  const index = courses.findIndex(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );
  if (index === -1) return null;

  if (config.weightages) {
    courses[index].weightages = config.weightages;

    // Recompute totalMarks with the new weightages
    if (courses[index].students) {
      courses[index].students = recomputeTotalMarks(
        courses[index].students,
        config.weightages
      );
    }
  }

  // ✅ Also persist total marks per assessment if provided
  if (config.totalMarks) {
    courses[index].totalMarks = config.totalMarks;
  }

  if (config.autoCutoffs)  courses[index].autoCutoffs  = config.autoCutoffs;
  if (config.manualCutoffs) courses[index].manualCutoffs = config.manualCutoffs;

  writeCourses(courses);
  return courses[index];
};

/* ─── Get grading config ─── */
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

module.exports = {
  computeGrades,
  getGradesByCourse,
  saveManualGrades,
  setGradeConfig,
  getGradeConfig,
};