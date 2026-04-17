const gradingService = require("../services/gradingService");

/* Compute grades for a course */
const computeGrades = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await gradingService.computeGrades(courseId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Grades computed successfully",
      data: result, // contains students + stats
    });
  } catch (error) {
    next(error);
  }
};

/* Get grades for a course */
const getGradesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await gradingService.getGradesByCourse(courseId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No grades found for course ${courseId}`,
      });
    }

    res.status(200).json({
      success: true,
      data: result, // 🔥 IMPORTANT: send same structure as compute
    });
  } catch (error) {
    next(error);
  }
};

/* Set grading config */
const setGradeConfig = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const config = req.body;

    const result = await gradingService.setGradeConfig(courseId, config);

    // Validation error returned as object with error key
    if (result?.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.status(200).json({
      success: true,
      message: "Grade config saved successfully",
      config: result.course,
    });
  } catch (error) {
    next(error);
  }
};

/* Get grading config */
const getGradeConfig = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const config = await gradingService.getGradeConfig(courseId);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `No grading config found for course ${courseId}`,
      });
    }

    res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    next(error);
  }
};

/* Save manual grades */
const saveManualGrades = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { students } = req.body;

    const result = await gradingService.saveManualGrades(
      courseId,
      students
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manual grades saved successfully",
      students: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  computeGrades,
  getGradesByCourse,
  setGradeConfig,
  getGradeConfig,
  saveManualGrades,
};