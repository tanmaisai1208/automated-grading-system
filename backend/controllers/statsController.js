const statsService = require("../services/statsService");

/*
  Get overall dashboard stats
  Example:
  totalCourses
  totalStudents
  averageMarks
  gradeCounts
*/
const getOverallStats = async (req, res, next) => {
  try {
    const stats = await statsService.getOverallStats();

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};


/*
  Get stats for one course
*/
const getCourseStats = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const stats = await statsService.getCourseStats(courseId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: `Stats not found for course ${courseId}`,
      });
    }

    res.status(200).json({
      success: true,
      courseId,
      stats,
    });
  } catch (error) {
    next(error);
  }
};


/*
  Get grade distribution
*/
const getGradeDistribution = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const distribution =
      await statsService.getGradeDistribution(courseId);

    res.status(200).json({
      success: true,
      courseId,
      distribution,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getOverallStats,
  getCourseStats,
  getGradeDistribution,
};