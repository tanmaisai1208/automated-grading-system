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
    arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    arr.length;
  return Math.sqrt(variance);
}

/* Relative grade */
function getGrade(marks, mean, sd) {
  if (marks >= mean + 1.5 * sd) return "AA";
  if (marks >= mean + 0.5 * sd) return "AB";
  if (marks >= mean) return "BB";
  if (marks >= mean - 0.5 * sd) return "BC";
  if (marks >= mean - sd) return "CC";
  if (marks >= mean - 1.5 * sd) return "CD";
  if (marks >= mean - 2 * sd) return "DD";
  return "F";
}

/* Compute grades and UPDATE courses.json */
const computeGrades = async (courseId) => {
  const courses = readCourses();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  const marksArray = course.students.map((s) => s.totalMarks);
  const mean = calculateMean(marksArray);
  const sd = calculateStdDev(marksArray, mean);

  course.students.forEach((student) => {
    const grade = getGrade(student.totalMarks, mean, sd);
    student.automatedGrade = grade;
  });

  // save stats also
  course.stats.mean = mean;
  course.stats.standardDeviation = sd;

  writeCourses(courses);

  return course.students;
};

/* Get grades */
const getGradesByCourse = async (courseId) => {
  const courses = readCourses();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  return course.students;
};

module.exports = {
  computeGrades,
  getGradesByCourse,
};