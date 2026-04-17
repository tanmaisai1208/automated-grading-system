const express = require("express");
const {
  computeGrades,
  getGradesByCourse,
  setGradeConfig,
  getGradeConfig,
  saveManualGrades,
} = require("../controllers/gradingController");

const router = express.Router();

router.get("/test", (req, res) => res.send("Grading route working"));

// ── specific routes FIRST ──
router.post("/compute/:courseId", computeGrades);
router.post("/manual/:courseId", saveManualGrades);
router.post("/config/:courseId", setGradeConfig);
router.get("/config/:courseId", getGradeConfig);   // must be before /:courseId

// ── wildcard LAST ──
router.get("/:courseId", getGradesByCourse);

module.exports = router;