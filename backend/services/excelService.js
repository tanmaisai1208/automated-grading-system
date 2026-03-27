const xlsx = require("xlsx");

const processExcel = (filePath) => {

  const workbook = xlsx.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const jsonData = xlsx.utils.sheet_to_json(sheet);

  // convert excel rows → students format
  const students = jsonData.map((row, index) => {

    const mid = Number(row.midsem) || 0;
    const end = Number(row.endsem) || 0;
    const quiz = Number(row.quiz) || 0;
    const assignment = Number(row.assignment) || 0;

    const total = mid + end + quiz + assignment;

    return {
      sno: index + 1,
      studentName: row.name || "",
      studentRollNo: row.rollNo || "",
      midsem: mid,
      endsem: end,
      quiz,
      assignment,
      totalMarks: total,
      automatedGrade: "",
      manualGrade: "",
    };

  });

  // stats
  const totals = students.map(s => s.totalMarks);

  const avg =
    totals.reduce((a, b) => a + b, 0) /
    (totals.length || 1);

  const min = Math.min(...totals);
  const max = Math.max(...totals);

  const stats = {
    average: Number(avg.toFixed(2)),
    min,
    max,
  };

  return {
    students,
    stats,
  };

};

module.exports = {
  processExcel,
};