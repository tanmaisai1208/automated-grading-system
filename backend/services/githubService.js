const fs = require("fs");
const axios = require("axios");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "tanmaisai1208";
const REPO = "automated-grading-system";
const FILE_PATH = "backend/data/courses.json";

/* 🔹 Fetch latest JSON from GitHub */
async function fetchCoursesFromGitHub() {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

    const res = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const content = Buffer.from(res.data.content, "base64").toString("utf-8");

    fs.writeFileSync("./data/courses.json", content);

    console.log("✅ Synced courses.json from GitHub");
  } catch (err) {
    console.error("❌ Failed to fetch from GitHub:", err.message);
  }
}

/* 🔹 Get SHA of existing file (required to update) */
async function getFileSha() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  return res.data.sha;
}

/* 🔹 Push updated JSON to GitHub */
async function updateCoursesFile(coursesData) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

    const sha = await getFileSha();

    const encodedContent = Buffer.from(
      JSON.stringify(coursesData, null, 2)
    ).toString("base64");

    await axios.put(
      url,
      {
        message: "Update courses data",
        content: encodedContent,
        sha: sha,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    console.log("✅ courses.json updated on GitHub");
  } catch (err) {
    console.error("❌ Failed to update GitHub:", err.message);
  }
}

module.exports = {
  fetchCoursesFromGitHub,
  updateCoursesFile,
};