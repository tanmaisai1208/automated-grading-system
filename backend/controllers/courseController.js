const courseService = require("../services/courseService");

/* Get all previous courses */
const getAllCourses = async (req, res, next) => {
  try {
    console.log("SESSION USER:", req.session.user);

    const courses = await courseService.getAllCourses(req.session.user);
    const user = req.session.user || null;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not logged in",
      });
    }
    
    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

/* Get one course by courseId */
const getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await courseService.getCourseById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with id '${courseId}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

/* Get summary of one course for card/dashboard usage */
const getCourseSummary = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const summary = await courseService.getCourseSummary(courseId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: `Course with id '${courseId}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

/* Get processed students table for CourseDetails page */
const getCourseStudentsTable = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const studentsTable = await courseService.getCourseStudentsTable(courseId);

    if (!studentsTable) {
      return res.status(404).json({
        success: false,
        message: `Course with id '${courseId}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      courseId,
      totalStudents: studentsTable.length,
      students: studentsTable,
    });
  } catch (error) {
    next(error);
  }
};

/* Save new course record */
const createCourse = async (req, res, next) => {
  try {
    const courseData = req.body;

    const newCourse = await courseService.createCourse(courseData);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    next(error);
  }
};

/* Update existing course */
const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const updatedCourse = await courseService.updateCourse(courseId, updates);

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: `Course with id '${courseId}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

/* Delete course */
const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const deleted = await courseService.deleteCourse(courseId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Course with id '${courseId}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudentsTable,
  getCourseSummary,
};