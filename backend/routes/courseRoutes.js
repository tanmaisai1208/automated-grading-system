const express = require("express");
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudentsTable,
  getCourseSummary,
} = require("../controllers/courseController");

const router = express.Router();

/*
  Course routes
  Base path in app.js:
  app.use("/api/courses", courseRoutes);
*/

/* Get all previous courses */
router.get("/", getAllCourses);

/* Get short summary/cards data for one course */
router.get("/:courseId/summary", getCourseSummary);

/* Get detailed student table for CourseDetails page */
router.get("/:courseId/students", getCourseStudentsTable);

/* Get full course object by courseId */
router.get("/:courseId", getCourseById);

/* Save new course record */
router.post("/", createCourse);

/* Update existing course record */
router.put("/:courseId", updateCourse);

/* Delete a course if needed later */
router.delete("/:courseId", deleteCourse);

module.exports = router;