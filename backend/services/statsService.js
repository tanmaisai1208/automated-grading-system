// const fs = require("fs").promises;
// const path = require("path");

// const dataFilePath = path.join(__dirname, "../data/courses.json");


// /* -----------------------------
//    Read courses from JSON
// ----------------------------- */
// const readCoursesFromFile = async () => {
//   try {
//     const data = await fs.readFile(dataFilePath, "utf-8");

//     if (!data.trim()) return [];

//     return JSON.parse(data);
//   } catch (error) {
//     if (error.code === "ENOENT") return [];
//     throw error;
//   }
// };


// /* -----------------------------
//    Get overall dashboard stats
// ----------------------------- */
// const getOverallStats = async () => {
//   const courses = await readCoursesFromFile();

//   let totalCourses = courses.length;
//   let totalStudents = 0;
//   let totalMarks = 0;
//   let marksCount = 0;

//   const gradeCounts = {};

//   courses.forEach((course) => {
//     if (!Array.isArray(course.students)) return;

//     totalStudents += course.students.length;

//     course.students.forEach((s) => {
//       if (s.totalMarks !== undefined) {
//         totalMarks += Number(s.totalMarks);
//         marksCount++;
//       }

//       const grade = s.manualGrade || s.automatedGrade;

//       if (grade) {
//         gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
//       }
//     });
//   });

//   const averageMarks =
//     marksCount === 0 ? 0 : (totalMarks / marksCount).toFixed(2);

//   return {
//     totalCourses,
//     totalStudents,
//     averageMarks,
//     gradeCounts,
//   };
// };


// /* -----------------------------
//    Stats for one course
// ----------------------------- */
// const getCourseStats = async (courseId) => {
//   const courses = await readCoursesFromFile();

//   const course = courses.find(
//     (c) =>
//       String(c.courseId).toLowerCase() ===
//       String(courseId).toLowerCase()
//   );

//   if (!course) return null;

//   let totalStudents = 0;
//   let totalMarks = 0;
//   let marksCount = 0;

//   const gradeCounts = {};

//   if (Array.isArray(course.students)) {
//     totalStudents = course.students.length;

//     course.students.forEach((s) => {
//       if (s.totalMarks !== undefined) {
//         totalMarks += Number(s.totalMarks);
//         marksCount++;
//       }

//       const grade = s.manualGrade || s.automatedGrade;

//       if (grade) {
//         gradeCounts[grade] =
//           (gradeCounts[grade] || 0) + 1;
//       }
//     });
//   }

//   const averageMarks =
//     marksCount === 0 ? 0 : (totalMarks / marksCount).toFixed(2);

//   return {
//     courseId: course.courseId,
//     courseName: course.courseName,
//     totalStudents,
//     averageMarks,
//     gradeCounts,
//   };
// };


// /* -----------------------------
//    Grade distribution only
// ----------------------------- */
// const getGradeDistribution = async (courseId) => {
//   const courses = await readCoursesFromFile();

//   const course = courses.find(
//     (c) =>
//       String(c.courseId).toLowerCase() ===
//       String(courseId).toLowerCase()
//   );

//   if (!course) return null;

//   const gradeCounts = {};

//   if (Array.isArray(course.students)) {
//     course.students.forEach((s) => {
//       const grade = s.manualGrade || s.automatedGrade;

//       if (grade) {
//         gradeCounts[grade] =
//           (gradeCounts[grade] || 0) + 1;
//       }
//     });
//   }

//   return gradeCounts;
// };


// module.exports = {
//   getOverallStats,
//   getCourseStats,
//   getGradeDistribution,
// };

const { fetchCoursesFromGitHub } = require("./githubService");

/* Overall stats */
const getOverallStats = async () => {
  const courses = await fetchCoursesFromGitHub();

  let totalCourses = courses.length;
  let totalStudents = 0;
  let totalMarks = 0;
  let marksCount = 0;

  const gradeCounts = {};

  courses.forEach((course) => {
    if (!Array.isArray(course.students)) return;

    totalStudents += course.students.length;

    course.students.forEach((s) => {
      const marks = Number(s.totalMarks) || 0;

      totalMarks += marks;
      marksCount++;

      const grade = s.manualGrade || s.automatedGrade;

      if (grade) {
        gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
      }
    });
  });

  const averageMarks =
    marksCount === 0 ? 0 : (totalMarks / marksCount).toFixed(2);

  return {
    totalCourses,
    totalStudents,
    averageMarks,
    gradeCounts,
  };
};

/* Course stats */
const getCourseStats = async (courseId) => {
  const courses = await fetchCoursesFromGitHub();

  const course = courses.find(
    (c) =>
      String(c.courseId).toLowerCase() ===
      String(courseId).toLowerCase()
  );

  if (!course) return null;

  let totalStudents = course.students?.length || 0;
  let totalMarks = 0;
  let marksCount = 0;

  const gradeCounts = {};

  (course.students || []).forEach((s) => {
    const marks = Number(s.totalMarks) || 0;

    totalMarks += marks;
    marksCount++;

    const grade = s.manualGrade || s.automatedGrade;

    if (grade) {
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    }
  });

  const averageMarks =
    marksCount === 0 ? 0 : (totalMarks / marksCount).toFixed(2);

  return {
    courseId: course.courseId,
    courseName: course.courseName,
    totalStudents,
    averageMarks,
    gradeCounts,
  };
};

/* Grade distribution */
const getGradeDistribution = async (courseId) => {
  const courses = await fetchCoursesFromGitHub();

  const course = courses.find(
    (c) =>
      String(c.courseId).toLowerCase() ===
      String(courseId).toLowerCase()
  );

  if (!course) return null;

  const gradeCounts = {};

  (course.students || []).forEach((s) => {
    const grade = s.manualGrade || s.automatedGrade;

    if (grade) {
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    }
  });

  return gradeCounts;
};

module.exports = {
  getOverallStats,
  getCourseStats,
  getGradeDistribution,
};