const express = require("express");
const {
  loginUser,
  googleLoginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} = require("../controllers/authController");

const router = express.Router();

/*
  Base path in app.js:
  app.use("/api/auth", authRoutes);
*/

router.post("/login", loginUser);
router.post('/register', registerUser);
router.post("/google-login", googleLoginUser);
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);

module.exports = router;