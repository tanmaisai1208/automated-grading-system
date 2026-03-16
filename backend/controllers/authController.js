const authService = require("../services/authService");

/* Normal email-password login */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authService.loginUser(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/* Google login */
const googleLoginUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await authService.googleLoginUser(name, email);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/* Current logged-in user fetch */
const getCurrentUser = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
    }

    const user = await authService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/* Logout */
const logoutUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  googleLoginUser,
  getCurrentUser,
  logoutUser,
};