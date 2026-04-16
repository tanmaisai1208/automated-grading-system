// const { processExcel } = require("../services/excelService");
// const courseService = require("../services/courseService");

// exports.uploadExcel = async (req, res) => {
//   try {
//     console.log("BODY:", req.body);

//     const { courseId, professorName, academicYear } = req.body;

//     // ✅ FILE CHECK
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const file = req.files.file;

//     const filePath = `./uploads/${Date.now()}-${file.name}`;

//     await file.mv(filePath);

//     // ✅ read excel — all columns become student attributes dynamically
//     const { students, initialWeightages } = await processExcel(filePath);

//     console.log("EXCEL:", students);

//     // ✅ CREATE COURSE with manually entered fields → saves into courses.json
//     const newCourse = await courseService.createCourse({
//       courseId,
//       courseName: courseId,
//       professorId: req.session.user ? req.session.user.id : null, // Fix: capture professorId from session
//       professorName,
//       academicYear,
//       students: students,
//       weightages: initialWeightages, // ✅ Save extracted weightages
//     });


//     res.json({
//       success: true,
//       message: "Upload successful",
//       course: newCourse,
//     });

//   } catch (err) {
//     console.error("UPLOAD ERROR:", err);

//     res.status(500).json({
//       success: false,
//       error: "Upload failed",
//     });
//   }
// };

const { processExcel } = require("../services/excelService");
const courseService = require("../services/courseService");
const fileService = require("../services/fileService");

exports.uploadExcel = async (req, res) => {
  try {
    const { courseId, professorName, academicYear } = req.body;

    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not logged in",
      });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.files.file;

    // ✅ use service
    const filePath = await fileService.saveFile(file);

    const { students, initialWeightages } =
      await processExcel(filePath);

    const newCourse = await courseService.createCourse({
      courseId,
      courseName: courseId,
      professorId: user.id,
      professorName,
      academicYear,
      students,
      weightages: initialWeightages,
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
      message: "Upload failed",
    });
  }
};