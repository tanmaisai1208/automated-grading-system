const { processExcel } = require("../services/excelService");
const courseService = require("../services/courseService");

exports.uploadExcel = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { courseId, professorName, academicYear } = req.body;

    // ✅ FILE CHECK
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;

    const filePath = `./uploads/${Date.now()}-${file.name}`;

    await file.mv(filePath);

    // ✅ read excel — all columns become student attributes dynamically
    const { students, initialWeightages, initialTotalMarks } = await processExcel(filePath);

    console.log("EXCEL:", students);

    // ✅ CREATE COURSE with manually entered fields → saves into courses.json
    const newCourse = await courseService.createCourse({
      courseId,
      courseName: courseId,
      professorId: req.session.user ? req.session.user.id : null, // Fix: capture professorId from session
      professorName,
      academicYear,
      students: students,
      weightages: initialWeightages,   // ✅ Save extracted weightages
      totalMarks: initialTotalMarks,   // ✅ Save extracted total marks per assessment
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