const express = require("express");
const {
  computeGrades,
  getGradesByCourse,
  setGradeConfig,
  getGradeConfig,
  saveManualGrades,
} = require("../controllers/gradingController");

const router = express.Router();

/*
  Base path in app.js:
  app.use("/api/grading", gradingRoutes);
*/

router.get("/test", (req, res) => {
  res.send("Grading route working");
});

router.post("/compute/:courseId", computeGrades);
router.get("/:courseId", getGradesByCourse);

router.post("/config/:courseId", setGradeConfig);
router.get("/config/:courseId", getGradeConfig);

router.post("/manual/:courseId", saveManualGrades);

module.exports = router;