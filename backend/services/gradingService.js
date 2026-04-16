// const fs = require("fs");
// const path = require("path");

// const coursesFile = path.join(__dirname, "../data/courses.json");

// /* Read courses.json */
// function readCourses() {
//   const data = fs.readFileSync(coursesFile, "utf8");
//   return JSON.parse(data);
// }

// /* Write courses.json */
// function writeCourses(data) {
//   fs.writeFileSync(coursesFile, JSON.stringify(data, null, 2));
// }

// /* Mean */
// function calculateMean(arr) {
//   return arr.reduce((a, b) => a + b, 0) / arr.length;
// }

// /* Standard deviation */
// function calculateStdDev(arr, mean) {
//   const variance =
//     arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
//   return Math.sqrt(variance);
// }

// /* Boundaries (NUMBERS, not strings) */
// function getGradeBoundaries(mean, sd) {
//   return {
//     AA: Math.round(mean + 1.5 * sd),
//     AB: Math.round(mean + 0.5 * sd),
//     BB: Math.round(mean),
//     BC: Math.round(mean - 0.5 * sd),
//     CC: Math.round(mean - sd),
//     CD: Math.round(mean - 1.5 * sd),
//     DD: Math.round(mean - 2 * sd),
//   };
// }

// /* Grade assignment */
// function getGrade(marks, boundaries) {
//   if (marks >= boundaries.AA) return "AA";
//   if (marks >= boundaries.AB) return "AB";
//   if (marks >= boundaries.BB) return "BB";
//   if (marks >= boundaries.BC) return "BC";
//   if (marks >= boundaries.CC) return "CC";
//   if (marks >= boundaries.CD) return "CD";
//   if (marks >= boundaries.DD) return "DD";
//   return "F";
// }

// /* Compute grades and UPDATE courses.json */
// const computeGrades = async (courseId) => {
//   const courses = readCourses();

//   const course = courses.find(
//     (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
//   );

//   if (!course) return null;

//   const students = course.students || [];

//   const marksArray = students.map((s) => s.totalMarks || 0);

//   const mean = calculateMean(marksArray);
//   const sd = calculateStdDev(marksArray, mean);

//   const boundaries = getGradeBoundaries(mean, sd);

//   // assign grades
//   course.students = students.map((student) => ({
//     ...student,
//     automatedGrade: getGrade(student.totalMarks || 0, boundaries),
//   }));

//   // ✅ ensure stats exists
//   if (!course.stats) course.stats = {};

//   // ✅ consistent naming
//   course.stats.mean = Number(mean.toFixed(2));
//   course.stats.sd = Number(sd.toFixed(2));
//   course.stats.boundaries = boundaries;

//   // write to file
//   writeCourses(courses);

//   return {
//     students: course.students,
//     stats: course.stats,
//   };
// };

// /* Get grades */
// const getGradesByCourse = async (courseId) => {
//   const courses = readCourses();

//   const course = courses.find(
//     (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
//   );

//   if (!course) return null;

//   return {
//     students: course.students || [],
//     stats: course.stats || {},
//   };
// };

// /* Save manual grades into courses.json */
// const saveManualGrades = async (courseId, students) => {
//   const courses = readCourses();

//   const course = courses.find(
//     (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
//   );

//   if (!course) return null;

//   // Map rollNo → manualGrade
//   const gradeMap = {};
//   students.forEach((s) => {
//     gradeMap[s.studentRollNo] = s.manualGrade;
//   });

//   // Update JSON
//   course.students.forEach((student) => {
//     if (gradeMap[student.studentRollNo]) {
//       student.manualGrade = gradeMap[student.studentRollNo];
//     }
//   });

//   writeCourses(courses);

//   return course.students;
// };

// /* Set grading config (weightages/cutoffs) */
// const setGradeConfig = async (courseId, config) => {
//   const courses = readCourses();

//   const index = courses.findIndex(
//     (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
//   );

//   if (index === -1) return null;

//   // Update course with new config values
//   if (config.weightages) {
//     courses[index].weightages = config.weightages;

//     // 🔥 Recalculate totalMarks for all students based on weightage columns
//     const assessmentKeys = Object.keys(config.weightages);

//     if (courses[index].students) {
//       courses[index].students = courses[index].students.map((student) => {
//         let total = 0;
//         assessmentKeys.forEach((key) => {
//           total += Number(student[key] || 0);
//         });

//         return {
//           ...student,
//           totalMarks: Number(total.toFixed(2)), // Store calculated total
//         };
//       });
//     }
//   }

//   if (config.autoCutoffs) {
//     courses[index].autoCutoffs = config.autoCutoffs;
//   }
//   if (config.manualCutoffs) {
//     courses[index].manualCutoffs = config.manualCutoffs;
//   }

//   writeCourses(courses);

//   return courses[index];
// };


// /* Get grading config */
// const getGradeConfig = async (courseId) => {
//   const courses = readCourses();

//   const course = courses.find(
//     (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
//   );

//   if (!course) return null;

//   return {
//     weightages: course.weightages || {},
//     autoCutoffs: course.autoCutoffs || {},
//     manualCutoffs: course.manualCutoffs || {},
//   };
// };

// module.exports = {
//   computeGrades,
//   getGradesByCourse,
//   saveManualGrades,
//   setGradeConfig,
//   getGradeConfig,
// };

const {
  fetchCoursesFromGitHub,
  updateCoursesFile,
} = require("./githubService");

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

/* Boundaries */
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

/* Compute grades */
const computeGrades = async (courseId) => {
  const courses = await fetchCoursesFromGitHub();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  const students = course.students || [];

  const marksArray = students.map((s) => Number(s.totalMarks) || 0);

  const mean = calculateMean(marksArray);
  const sd = calculateStdDev(marksArray, mean);

  const boundaries = getGradeBoundaries(mean, sd);

  course.students = students.map((student) => ({
    ...student,
    automatedGrade: getGrade(Number(student.totalMarks) || 0, boundaries),
  }));

  if (!course.stats) course.stats = {};

  course.stats.mean = Number(mean.toFixed(2));
  course.stats.sd = Number(sd.toFixed(2));
  course.stats.boundaries = boundaries;

  await updateCoursesFile(courses);

  return {
    students: course.students,
    stats: course.stats,
  };
};

/* Get grades */
const getGradesByCourse = async (courseId) => {
  const courses = await fetchCoursesFromGitHub();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  return {
    students: course.students || [],
    stats: course.stats || {},
  };
};

/* Save manual grades */
const saveManualGrades = async (courseId, students) => {
  const courses = await fetchCoursesFromGitHub();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  const gradeMap = {};
  students.forEach((s) => {
    gradeMap[s.studentRollNo] = s.manualGrade;
  });

  course.students.forEach((student) => {
    if (gradeMap[student.studentRollNo]) {
      student.manualGrade = gradeMap[student.studentRollNo];
    }
  });

  await updateCoursesFile(courses);

  return course.students;
};

/* Set grading config */
const setGradeConfig = async (courseId, config) => {
  const courses = await fetchCoursesFromGitHub();

  const index = courses.findIndex(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (index === -1) return null;

  if (config.weightages) {
    courses[index].weightages = config.weightages;

    const keys = Object.keys(config.weightages);

    courses[index].students = courses[index].students.map((student) => {
      let total = 0;

      keys.forEach((key) => {
        total += Number(student[key] || 0);
      });

      return {
        ...student,
        totalMarks: Number(total.toFixed(2)),
      };
    });
  }

  if (config.autoCutoffs) {
    courses[index].autoCutoffs = config.autoCutoffs;
  }

  if (config.manualCutoffs) {
    courses[index].manualCutoffs = config.manualCutoffs;
  }

  await updateCoursesFile(courses);

  return courses[index];
};

/* Get config */
const getGradeConfig = async (courseId) => {
  const courses = await fetchCoursesFromGitHub();

  const course = courses.find(
    (c) => c.courseId.toLowerCase() === courseId.toLowerCase()
  );

  if (!course) return null;

  return {
    weightages: course.weightages || {},
    autoCutoffs: course.autoCutoffs || {},
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