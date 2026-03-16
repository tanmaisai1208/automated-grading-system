const express = require("express");

const {
  getOverallStats,
  getCourseStats,
  getGradeDistribution,
} = require("../controllers/statsController");

const router = express.Router();


/*
  GET /api/stats/overall
  Dashboard stats
*/
router.get("/overall", getOverallStats);


/*
  GET /api/stats/:courseId
  Stats for one course
*/
router.get("/:courseId", getCourseStats);


/*
  GET /api/stats/:courseId/grades
  Grade distribution
*/
router.get("/:courseId/grades", getGradeDistribution);


module.exports = router;