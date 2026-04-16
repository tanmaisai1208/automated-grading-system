// const fs = require("fs").promises;
// const path = require("path");

// const dataFilePath = path.join(__dirname, "../data/courses.json");
// const usersFilePath = path.join(__dirname, "../data/users.json");

// /* Read JSON helpers */
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

// const readUsersFromFile = async () => {
//   const data = await fs.readFile(usersFilePath, "utf-8");
//   return JSON.parse(data);
// };

// /* Normalize */
// const normalizeCourseId = (courseId) => {
//   return String(courseId).trim().toLowerCase();
// };

// /* 🔥 UPDATED: Get courses based on user */
// const getAllCourses = async (user) => {
//   const courses = await readCoursesFromFile();

//   console.log("USER IN SERVICE:", user);

//   if (!user) {
//     return []; // no session → no courses
//   }

//   let filteredCourses = [];

//   if (user.role === "professor") {
//     filteredCourses = courses.filter(
//       (course) => course.professorId === user.id
//     );
//   } else if (user.role === "student") {
//     filteredCourses = courses.filter((course) =>
//       course.students.some(
//         (student) =>
//           student.studentRollNo &&
//           user.rollNo &&
//           student.studentRollNo.toLowerCase() === user.rollNo.toLowerCase()
//       )
//     );
//   }

//   return filteredCourses.map((course) => ({
//     courseId: course.courseId,
//     courseName: course.courseName,
//     courseCode: course.courseCode || course.courseId,
//     professorName: course.professorName || "",
//     semester: course.semester || "",
//     academicYear: course.academicYear || "",
//     uploadedAt: course.uploadedAt || "",
//     totalStudents: Array.isArray(course.students)
//       ? course.students.length
//       : 0,
//     stats: course.stats || {},
//   }));
// };

// /* Get full course by courseId */
// const getCourseById = async (courseId) => {
//   const courses = await readCoursesFromFile();

//   return (
//     courses.find(
//       (course) =>
//         normalizeCourseId(course.courseId) === normalizeCourseId(courseId)
//     ) || null
//   );
// };

// /* Keep rest SAME */

// const getCourseSummary = async (courseId) => {
//   const course = await getCourseById(courseId);
//   if (!course) return null;

//   return {
//     courseId: course.courseId,
//     courseName: course.courseName,
//     courseCode: course.courseCode || course.courseId,
//     professorId: course.professorId || "",
//     professorName: course.professorName || "",
//     semester: course.semester || "",
//     academicYear: course.academicYear || "",
//     uploadedAt: course.uploadedAt || "",
//     totalStudents: Array.isArray(course.students) ? course.students.length : 0,
//     stats: course.stats || {},
//     autoCutoffs: course.autoCutoffs || {},
//     manualCutoffs: course.manualCutoffs || {},
//   };
// };

// const getCourseStudentsTable = async (courseId) => {
//   const course = await getCourseById(courseId);
//   if (!course) return null;
//   return Array.isArray(course.students) ? course.students : [];
// };

// /* 🔥 UPDATED createCourse */
// const createCourse = async (courseData) => {
//   const courses = await readCoursesFromFile();

//   const newCourse = {
//     courseId: courseData.courseId,
//     courseName: courseData.courseName,
//     courseCode: courseData.courseCode || courseData.courseId,

//     professorId: courseData.professorId,
//     professorName: courseData.professorName || "",

//     semester: courseData.semester || "",
//     academicYear: courseData.academicYear || "",
//     uploadedAt: new Date().toISOString(),

//     students: courseData.students || [],
//     stats: courseData.stats || {},
//     weightages: courseData.weightages || {}, // ✅ Store initial weightages
//     autoCutoffs: {},
//     manualCutoffs: {},
//   };


//   courses.push(newCourse);
//   await fs.writeFile(dataFilePath, JSON.stringify(courses, null, 2));

//   return newCourse;
// };

// /* unchanged */
// const updateCourse = async (courseId, updates) => {
//   const courses = await readCoursesFromFile();

//   const index = courses.findIndex(
//     (course) =>
//       normalizeCourseId(course.courseId) === normalizeCourseId(courseId)
//   );

//   if (index === -1) return null;

//   const updatedCourse = {
//     ...courses[index],
//     ...updates,
//     courseId: courses[index].courseId,
//   };

//   courses[index] = updatedCourse;
//   await fs.writeFile(dataFilePath, JSON.stringify(courses, null, 2));

//   return updatedCourse;
// };

// const deleteCourse = async (courseId) => {
//   const courses = await readCoursesFromFile();

//   const filteredCourses = courses.filter(
//     (course) =>
//       normalizeCourseId(course.courseId) !== normalizeCourseId(courseId)
//   );

//   if (filteredCourses.length === courses.length) return false;

//   await fs.writeFile(dataFilePath, JSON.stringify(filteredCourses, null, 2));
//   return true;
// };

// module.exports = {
//   getAllCourses,
//   getCourseById,
//   getCourseSummary,
//   getCourseStudentsTable,
//   createCourse,
//   updateCourse,
//   deleteCourse,
// };

const fs = require("fs").promises;
const path = require("path");

// 🔥 IMPORT GITHUB SERVICE
const { updateCoursesFile } = require("./githubService");

const dataFilePath = path.join(__dirname, "../data/courses.json");
const usersFilePath = path.join(__dirname, "../data/users.json");

/* Read JSON helpers */
const readCoursesFromFile = async () => {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    if (!data.trim()) return [];
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
};

const readUsersFromFile = async () => {
  const data = await fs.readFile(usersFilePath, "utf-8");
  return JSON.parse(data);
};

/* 🔥 NEW: Centralized write function */
const writeCoursesToFile = async (courses) => {
  // 1. Write locally
  await fs.writeFile(dataFilePath, JSON.stringify(courses, null, 2));

  // 2. Push to GitHub (persistence)
  try {
    await updateCoursesFile(courses);
    console.log("✅ Synced courses.json to GitHub");
  } catch (err) {
    console.error("❌ GitHub sync failed:", err.message);
  }
};

/* Normalize */
const normalizeCourseId = (courseId) => {
  return String(courseId).trim().toLowerCase();
};

/* 🔥 Get courses based on user */
const getAllCourses = async (user) => {
  const courses = await readCoursesFromFile();

  if (!user) return [];

  let filteredCourses = [];

  if (user.role === "professor") {
    filteredCourses = courses.filter(
      (course) => course.professorId === user.id
    );
  } else if (user.role === "student") {
    filteredCourses = courses.filter((course) =>
      course.students.some(
        (student) =>
          student.studentRollNo &&
          user.rollNo &&
          student.studentRollNo.toLowerCase() === user.rollNo.toLowerCase()
      )
    );
  }

  return filteredCourses.map((course) => ({
    courseId: course.courseId,
    courseName: course.courseName,
    courseCode: course.courseCode || course.courseId,
    professorName: course.professorName || "",
    semester: course.semester || "",
    academicYear: course.academicYear || "",
    uploadedAt: course.uploadedAt || "",
    totalStudents: Array.isArray(course.students)
      ? course.students.length
      : 0,
    stats: course.stats || {},
  }));
};

/* Get full course */
const getCourseById = async (courseId) => {
  const courses = await readCoursesFromFile();

  return (
    courses.find(
      (course) =>
        normalizeCourseId(course.courseId) === normalizeCourseId(courseId)
    ) || null
  );
};

/* Summary */
const getCourseSummary = async (courseId) => {
  const course = await getCourseById(courseId);
  if (!course) return null;

  return {
    courseId: course.courseId,
    courseName: course.courseName,
    courseCode: course.courseCode || course.courseId,
    professorId: course.professorId || "",
    professorName: course.professorName || "",
    semester: course.semester || "",
    academicYear: course.academicYear || "",
    uploadedAt: course.uploadedAt || "",
    totalStudents: Array.isArray(course.students)
      ? course.students.length
      : 0,
    stats: course.stats || {},
    autoCutoffs: course.autoCutoffs || {},
    manualCutoffs: course.manualCutoffs || {},
  };
};

/* Students Table */
const getCourseStudentsTable = async (courseId) => {
  const course = await getCourseById(courseId);
  if (!course) return null;
  return Array.isArray(course.students) ? course.students : [];
};

/* 🔥 CREATE COURSE (UPDATED) */
const createCourse = async (courseData) => {
  const courses = await readCoursesFromFile();

  const newCourse = {
    courseId: courseData.courseId,
    courseName: courseData.courseName,
    courseCode: courseData.courseCode || courseData.courseId,

    professorId: courseData.professorId,
    professorName: courseData.professorName || "",

    semester: courseData.semester || "",
    academicYear: courseData.academicYear || "",
    uploadedAt: new Date().toISOString(),

    students: courseData.students || [],
    stats: courseData.stats || {},
    weightages: courseData.weightages || {},
    autoCutoffs: {},
    manualCutoffs: {},
  };

  courses.push(newCourse);

  // 🔥 USE CENTRALIZED WRITE
  await writeCoursesToFile(courses);

  return newCourse;
};

/* 🔥 UPDATE COURSE (UPDATED) */
const updateCourse = async (courseId, updates) => {
  const courses = await readCoursesFromFile();

  const index = courses.findIndex(
    (course) =>
      normalizeCourseId(course.courseId) === normalizeCourseId(courseId)
  );

  if (index === -1) return null;

  const updatedCourse = {
    ...courses[index],
    ...updates,
    courseId: courses[index].courseId,
  };

  courses[index] = updatedCourse;

  // 🔥 USE CENTRALIZED WRITE
  await writeCoursesToFile(courses);

  return updatedCourse;
};

/* 🔥 DELETE COURSE (UPDATED) */
const deleteCourse = async (courseId) => {
  const courses = await readCoursesFromFile();

  const filteredCourses = courses.filter(
    (course) =>
      normalizeCourseId(course.courseId) !== normalizeCourseId(courseId)
  );

  if (filteredCourses.length === courses.length) return false;

  // 🔥 USE CENTRALIZED WRITE
  await writeCoursesToFile(filteredCourses);

  return true;
};

module.exports = {
  getAllCourses,
  getCourseById,
  getCourseSummary,
  getCourseStudentsTable,
  createCourse,
  updateCourse,
  deleteCourse,
};