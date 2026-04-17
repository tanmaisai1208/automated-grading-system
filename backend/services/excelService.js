const xlsx = require("xlsx");
const { mapColumns } = require("./columnMapperService");

/*
  Reads an Excel file and maps each row to a standardized student object.
  Column headers are mapped using Gemini Flash (or rule-based fallback).

  Every student object always has these fields (blank if not in sheet):
    sno, studentName, studentRollNo, totalMarks, automatedGrade, manualGrade
  Plus any extra mapped columns (midsem, endsem, quiz1, quiz2, assignment, lab, etc.)
*/
const processExcel = async (filePath) => {

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  if (!jsonData.length) return { students: [], initialWeightages: {}, initialTotalMarks: {} };

  // Extract column headers from the first row
  const columnHeaders = Object.keys(jsonData[0]);

  // Use LLM (or fallback) to get { mappings: { "Org": "Std" }, weightages: { "Std": val } }
  const { mappings, weightages: initialWeightages, totalMarks: initialTotalMarks } = await mapColumns(columnHeaders);

  // Build student objects using the mapped keys
  const students = jsonData.map((row, index) => {
    // Start with required system fields (blank defaults)
    const student = {
      sno: index + 1,
      studentName: "",
      studentRollNo: "",
      totalMarks: "",
      automatedGrade: "",
      manualGrade: "",
    };

    // Apply each column from the row using the mapped key name
    Object.entries(row).forEach(([originalCol, value]) => {
      const mappedKey = mappings[originalCol] || originalCol;
      student[mappedKey] = value;
    });

    return student;
  });

  return { students, initialWeightages, initialTotalMarks };

};


module.exports = { processExcel };