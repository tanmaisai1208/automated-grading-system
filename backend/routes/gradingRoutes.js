const express = require("express");
const {
  computeGrades,
  getGradesByCourse,
  setGradeConfig,
  getGradeConfig,
  saveManualGrades,
  applyBoundaryEdit,
} = require("../controllers/gradingController");

const router = express.Router();

router.get("/test", (req, res) => res.send("Grading route working"));

// ── specific routes FIRST, wildcard LAST ──
router.post("/compute/:courseId",   computeGrades);
router.post("/manual/:courseId",    saveManualGrades);
router.post("/config/:courseId",    setGradeConfig);
router.get("/config/:courseId",     getGradeConfig);
router.post("/boundary/:courseId",  applyBoundaryEdit);  // ← new

router.get("/:courseId", getGradesByCourse);

module.exports = router;