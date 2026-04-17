const { GoogleGenAI } = require("@google/genai");

/*
  Sends column headers to Gemini Flash and gets back a mapping:
  { "Original Column Name": "standardizedFieldName", ... }

  Falls back to rule-based mapping if no GEMINI_API_KEY is set or LLM fails.
*/
async function mapColumns(columnHeaders) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[columnMapper] No GEMINI_API_KEY — using rule-based fallback");
    return ruleBasedMap(columnHeaders);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are mapping Excel column headers from a student marksheet to standardized field names and extracting potential weightages and total marks.

Column headers from the sheet: ${JSON.stringify(columnHeaders)}

Standard field names to map to:
- studentName      → for student name / full name columns
- studentRollNo    → for roll number / registration / student ID columns
- midsem           → for mid-semester / midterm exam marks
- endsem           → for end-semester / final exam marks
- quiz             → for a single quiz column
- quiz1, quiz2 ... → if multiple quiz columns exist, number them
- assignment       → for a single assignment / homework column
- assignment1, assignment2 ... → if multiple assignment columns, number them
- lab              → for a single lab / practical column
- lab1, lab2 ...   → if multiple lab columns, number them
- project          → for a single project column
- project1, project2 ... → if multiple project columns, number them
- totalMarks       → for total / aggregate / grand total marks
- If a column does not fit any category, use a lowercased camelCase version of the original name

Rules for Mapping:
- Every column header must be mapped to exactly one field name
- Consistent naming: same category always uses the same base name
- If there are multiple columns of the same type (e.g. Quiz 1, Quiz 2), number them starting from 1

Rules for Weightage Extraction:
- Look for percentages or numbers in parentheses or near keywords like "pct", "percent", "weightage" (e.g., "Midsem (30%)", "Quiz [10 pct]").
- Extract the number only (e.g., 30).
- If no weightage is found for a column, do not include it in the weightages object.

Rules for Total Marks Extraction:
- Look for phrases like "out of N", "/N", "(N marks)", "[N marks]", "max N", "max: N" in the header.
- Extract the number N only (e.g., "Quiz /10" → 10, "Midsem (out of 50)" → 50).
- If no total marks info is found for a column, do not include it in the totalMarks object.

Return ONLY a valid JSON object with three keys: "mappings" (the field maps), "weightages" (extracted weightage percentages mapped to standardized field names), and "totalMarks" (extracted total/max marks mapped to standardized field names). No explanation, no markdown.

Example output:
{
  "mappings": {"Name": "studentName", "Mid Sem (30%) /50": "midsem", "Quiz /10": "quiz"},
  "weightages": {"midsem": 30},
  "totalMarks": {"midsem": 50, "quiz": 10}
}
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text.trim();

    // Extract JSON from the response (strip any markdown fences if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in LLM response");

    const parsed = JSON.parse(jsonMatch[0]);
    // Ensure totalMarks key always exists
    if (!parsed.totalMarks) parsed.totalMarks = {};
    console.log("[columnMapper] LLM result:", parsed);
    return parsed;

  } catch (err) {
    console.error("[columnMapper] LLM failed, using rule-based fallback:", err.message);
    return ruleBasedMap(columnHeaders);
  }
}


/*
  Rule-based fallback: handles common header patterns without an API.
*/
function ruleBasedMap(headers) {
  const counters = {};
  const mapping = {};
  const weightages = {};
  const totalMarks = {};

  headers.forEach((header) => {
    const h = header.toLowerCase().replace(/[\s_\-]+/g, "");

    // Try to extract weightage number: e.g. "(30%)" -> 30
    const weightMatch = header.match(/\(?(\d+)\s?(%|pct|percent)\)?/i) || header.match(/weightage:?\s?(\d+)/i);
    let extractedWeight = null;
    if (weightMatch) {
      extractedWeight = parseInt(weightMatch[1], 10);
    }

    // Try to extract total marks: e.g. "/10", "out of 10", "(10 marks)", "[10 marks]", "max 10", "max: 10"
    const totalMatch =
      header.match(/\/\s*(\d+)/) ||
      header.match(/out\s+of\s+(\d+)/i) ||
      header.match(/\(?\[?(\d+)\s*marks?\]?\)?/i) ||
      header.match(/max:?\s*(\d+)/i);
    let extractedTotal = null;
    if (totalMatch) {
      // Make sure this number isn't already captured as a weightage percentage
      const candidate = parseInt(totalMatch[1], 10);
      // Avoid double-counting if same number was already the weightage
      if (extractedWeight === null || candidate !== extractedWeight) {
        extractedTotal = candidate;
      }
    }

    let mappedKey = "";

    if (/^(name|studentname|fullname|student)$/.test(h)) {
      mappedKey = "studentName";

    } else if (/roll|regno|regn|studentid|enrollment|rollno/.test(h)) {
      mappedKey = "studentRollNo";

    } else if (/mid|midsem|midterm|midsemester/.test(h)) {
      mappedKey = "midsem";

    } else if (/end|endsem|final|endsemester|semester/.test(h) && !/mid/.test(h)) {
      mappedKey = "endsem";

    } else if (/quiz/.test(h)) {
      counters.quiz = (counters.quiz || 0) + 1;
      mappedKey = counters.quiz === 1 ? "quiz" : `quiz${counters.quiz}`;

    } else if (/assign|hw|homework/.test(h)) {
      counters.assignment = (counters.assignment || 0) + 1;
      mappedKey = counters.assignment === 1 ? "assignment" : `assignment${counters.assignment}`;

    } else if (/lab|practical/.test(h)) {
      counters.lab = (counters.lab || 0) + 1;
      mappedKey = counters.lab === 1 ? "lab" : `lab${counters.lab}`;

    } else if (/project/.test(h)) {
      counters.project = (counters.project || 0) + 1;
      mappedKey = counters.project === 1 ? "project" : `project${counters.project}`;

    } else if (/total|aggregate|grand/.test(h)) {
      mappedKey = "totalMarks";

    } else {
      // unknown: camelCase the header as-is
      mappedKey = h;
    }

    mapping[header] = mappedKey;
    if (extractedWeight !== null) {
      weightages[mappedKey] = extractedWeight;
    }
    if (extractedTotal !== null) {
      totalMarks[mappedKey] = extractedTotal;
    }
  });

  const result = { mappings: mapping, weightages, totalMarks };
  console.log("[columnMapper] Rule-based mapping:", result);
  return result;
}


module.exports = { mapColumns };

