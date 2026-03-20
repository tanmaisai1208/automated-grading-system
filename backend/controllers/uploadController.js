import { processExcel } from "../services/excelService.js";

export const uploadExcel = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { courseName, batch, coordinators } = req.body;

    if (!req.files || !req.files.file) {
      console.log("No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;

    console.log("FILE RECEIVED:", file.name);

    const filePath = `./uploads/${Date.now()}-${file.name}`;

    await file.mv(filePath);
    console.log("FILE SAVED AT:", filePath);

    const data = processExcel(filePath);

    console.log("EXCEL DATA:", data);

    res.json({
      success: true,
      message: "Upload successful",
      courseName,
      batch,
      coordinators,
      data,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Upload failed",
    });
  }
};