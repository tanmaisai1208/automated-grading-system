const { processExcel } = require("../services/excelService");
const courseService = require("../services/courseService");

exports.uploadExcel = async (req, res) => {
  try {

    console.log("BODY:", req.body);

    const { courseName, batch, coordinators } = req.body;

    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;

    const filePath = `./uploads/${Date.now()}-${file.name}`;

    await file.mv(filePath);

    // ✅ read excel
    const excelData = processExcel(filePath);

    console.log("EXCEL:", excelData);

    // ✅ create course object for courseService
    const newCourse = await courseService.createCourse({
      courseId: courseName,
      courseName: courseName,
      semester: batch,
      academicYear: "2025-26",
      students: excelData.students,
      stats: excelData.stats,
    });

    res.json({
      success: true,
      message: "Upload successful",
      course: newCourse,
    });

  } catch (err) {

    console.error("UPLOAD ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Upload failed",
    });

  }
};