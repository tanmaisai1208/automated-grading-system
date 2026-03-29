const gradingService = require("../services/gradingService");

/* Compute grades for a course */
const computeGrades = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await gradingService.computeGrades(courseId);

    res.status(200).json({
      success: true,
      message: "Grades computed and saved to courses.json",
      students: result,
    });
  } catch (error) {
    next(error);
  }
};

/* Get grades for a course */
const getGradesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const grades = await gradingService.getGradesByCourse(courseId);

    if (!grades) {
      return res.status(404).json({
        success: false,
        message: `No grades found for course ${courseId}`,
      });
    }

    res.status(200).json({
      success: true,
      courseId,
      totalStudents: grades.length,
      grades,
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

    const savedConfig = await gradingService.setGradeConfig(
      courseId,
      config
    );

    res.status(200).json({
      success: true,
      message: "Grade config saved successfully",
      config: savedConfig,
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

module.exports = {
  computeGrades,
  getGradesByCourse,
  setGradeConfig,
  getGradeConfig,
};