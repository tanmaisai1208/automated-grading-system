// require("dotenv").config();
// const app = require("./app");

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


require("dotenv").config();
const app = require("./app");
const { fetchCoursesFromGitHub } = require("./services/githubService");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await fetchCoursesFromGitHub(); // 🔥 VERY IMPORTANT

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error syncing data:", err);
  }
};

startServer();