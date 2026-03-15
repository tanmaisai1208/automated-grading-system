const fs = require("fs").promises;
const path = require("path");

const dataFilePath = path.join(__dirname, "../data/courses.json");

/* Read all courses from JSON file */
const readCoursesFromFile = async () => {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

/* Write all courses back to JSON file */
const writeCoursesToFile = async (courses) => {
  await fs.writeFile(dataFilePath, JSON.stringify(courses, null, 2), "utf-8");
};

/* Normalize courseId matching */
const normalizeCourseId = (courseId) => {
  return String(courseId).trim().toLowerCase();
};

/* Get all courses */
const getAllCourses = async () => {
  const courses = await readCoursesFromFile();

  /*
    Return lighter data useful for:
    - previousCourses cards
    - dashboard cards/history
  */
  return courses.map((course) => ({
    courseId: course.courseId,
    courseName: course.courseName,
    courseCode: course.courseCode || course.courseId,
    professorName: course.professorName || "",
    semester: course.semester || "",
    academicYear: course.academicYear || "",
    uploadedAt: course.uploadedAt || "",
    totalStudents: Array.isArray(course.students) ? course.students.length : 0,
    stats: course.stats || {},
  }));
};

/* Get full course by courseId */
const getCourseById = async (courseId) => {
  const courses = await readCoursesFromFile();

  return (
    courses.find(
      (course) =>
        normalizeCourseId(course.courseId) === normalizeCourseId(courseId)
    ) || null
  );
};

/* Get summary for one course card/details header */
const getCourseSummary = async (courseId) => {
  const course = await getCourseById(courseId);

  if (!course) return null;

  return {
    courseId: course.courseId,
    courseName: course.courseName,
    courseCode: course.courseCode || course.courseId,
    professorName: course.professorName || "",
    semester: course.semester || "",
    academicYear: course.academicYear || "",
    uploadedAt: course.uploadedAt || "",
    totalStudents: Array.isArray(course.students) ? course.students.length : 0,
    stats: course.stats || {},
    autoCutoffs: course.autoCutoffs || {},
    manualCutoffs: course.manualCutoffs || {},
  };
};

/* Get processed students table for CourseDetails page */
const getCourseStudentsTable = async (courseId) => {
  const course = await getCourseById(courseId);

  if (!course) return null;

  return Array.isArray(course.students) ? course.students : [];
};

/* Create new course */
const createCourse = async (courseData) => {
  const courses = await readCoursesFromFile();

  if (!courseData.courseId || !courseData.courseName) {
    const error = new Error("courseId and courseName are required");
    error.status = 400;
    throw error;
  }

  const alreadyExists = courses.find(
    (course) =>
      normalizeCourseId(course.courseId) ===
      normalizeCourseId(courseData.courseId)
  );

  if (alreadyExists) {
    const error = new Error("Course with this courseId already exists");
    error.status = 400;
    throw error;
  }

  const newCourse = {
    courseId: courseData.courseId,
    courseName: courseData.courseName,
    courseCode: courseData.courseCode || courseData.courseId,
    professorName: courseData.professorName || "",
    semester: courseData.semester || "",
    academicYear: courseData.academicYear || "",
    uploadedAt: courseData.uploadedAt || new Date().toISOString(),

    /*
      students array is expected to hold processed rows like:
      [
        {
          sno,
          studentName,
          studentEmail,
          studentRollNo,
          midsem,
          endsem,
          quiz,
          assignment,
          totalMarks,
          automatedGrade,
          manualGrade
        }
      ]
    */
    students: Array.isArray(courseData.students) ? courseData.students : [],

    stats: courseData.stats || {},
    autoCutoffs: courseData.autoCutoffs || {},
    manualCutoffs: courseData.manualCutoffs || {},
  };

  courses.push(newCourse);
  await writeCoursesToFile(courses);

  return newCourse;
};

/* Update course */
const updateCourse = async (courseId, updates) => {
  const courses = await readCoursesFromFile();

  const index = courses.findIndex(
    (course) =>
      normalizeCourseId(course.courseId) === normalizeCourseId(courseId)
  );

  if (index === -1) {
    return null;
  }

  const existingCourse = courses[index];

  const updatedCourse = {
    ...existingCourse,
    ...updates,
    courseId: existingCourse.courseId, // prevent changing primary identity
  };

  courses[index] = updatedCourse;
  await writeCoursesToFile(courses);

  return updatedCourse;
};

/* Delete course */
const deleteCourse = async (courseId) => {
  const courses = await readCoursesFromFile();

  const filteredCourses = courses.filter(
    (course) =>
      normalizeCourseId(course.courseId) !== normalizeCourseId(courseId)
  );

  if (filteredCourses.length === courses.length) {
    return false;
  }

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