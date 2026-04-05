const fs = require("fs");
const path = require("path");

const coursesFile = path.join(__dirname, "../data/courses.json");

/* Read courses.json */
function readCourses() {
  const data = fs.readFileSync(coursesFile, "utf8");
  return JSON.parse(data);
}

/* Write courses.json */
function writeCourses(data) {
  fs.writeFileSync(coursesFile, JSON.stringify(data, null, 2));
}

/* Mean */
function calculateMean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/* Standard deviation */
function calculateStdDev(arr, mean) {
  const variance =
    arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

/* Boundaries (NUMBERS, not strings) */
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

/* Grade assignment */
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

/* Compute grades and UPDATE courses.json */
const computeGrades = async (courseId) => {
  const courses = readCourses();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  const students = course.students || [];

  const marksArray = students.map((s) => s.totalMarks || 0);

  const mean = calculateMean(marksArray);
  const sd = calculateStdDev(marksArray, mean);

  const boundaries = getGradeBoundaries(mean, sd);

  // assign grades
  course.students = students.map((student) => ({
    ...student,
    automatedGrade: getGrade(student.totalMarks || 0, boundaries),
  }));

  // ✅ ensure stats exists
  if (!course.stats) course.stats = {};

  // ✅ consistent naming
  course.stats.mean = Number(mean.toFixed(2));
  course.stats.sd = Number(sd.toFixed(2));
  course.stats.boundaries = boundaries;

  // write to file
  writeCourses(courses);

  return {
    students: course.students,
    stats: course.stats,
  };
};

/* Get grades */
const getGradesByCourse = async (courseId) => {
  const courses = readCourses();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  return {
    students: course.students || [],
    stats: course.stats || {},
  };
};

/* Save manual grades into courses.json */
const saveManualGrades = async (courseId, students) => {
  const courses = readCourses();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  // Map rollNo → manualGrade
  const gradeMap = {};
  students.forEach((s) => {
    gradeMap[s.studentRollNo] = s.manualGrade;
  });

  // Update JSON
  course.students.forEach((student) => {
    if (gradeMap[student.studentRollNo]) {
      student.manualGrade = gradeMap[student.studentRollNo];
    }
  });

  writeCourses(courses);

  return course.students;
};

module.exports = {
  computeGrades,
  getGradesByCourse,
  saveManualGrades,
};