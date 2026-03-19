const courseService = require("./courseService");

// In-memory storage (replace with DB later)
let gradeConfigs = {};
let computedGrades = {};

/* Default grade boundaries */
const defaultBoundaries = [
  { grade: "A", min: 85 },
  { grade: "B", min: 70 },
  { grade: "C", min: 55 },
  { grade: "D", min: 40 },
  { grade: "F", min: 0 },
];

/* Compute grades */
const computeGrades = async (courseId) => {
  const students = await courseService.getCourseStudentsTable(courseId);

  if (!students) return null;

  const config = gradeConfigs[courseId] || defaultBoundaries;

  const graded = students.map((student) => {
    const marks = student.totalMarks  || student.total || 0;

    let assignedGrade = "F";

    for (let boundary of config) {
      if (marks >= boundary.min) {
        assignedGrade = boundary.grade;
        break;
      }
    }

    return {
      ...student,
      grade: assignedGrade,
    };
  });

  computedGrades[courseId] = graded;

  return graded;
};

/* Get grades */
const getGradesByCourse = async (courseId) => {
  return computedGrades[courseId] || null;
};

/* Set grading config */
const setGradeConfig = async (courseId, config) => {
  gradeConfigs[courseId] = config;
  return config;
};

/* Get grading config */
const getGradeConfig = async (courseId) => {
  return gradeConfigs[courseId] || defaultBoundaries;
};

module.exports = {
  computeGrades,
  getGradesByCourse,
  setGradeConfig,
  getGradeConfig,
};