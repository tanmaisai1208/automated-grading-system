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
    
    req.session.user = user;
    console.log("LOGIN USER:", user);
    console.log("SESSION AFTER SET:", req.session.user);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/* Register */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNo } = req.body;

    const user = await authService.registerUser({
      name,
      email,
      password,
      role,
      rollNo,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
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

    req.session.user = user;

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
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "Not logged in",
      });
    }

    res.status(200).json({
      success: true,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};


/* Logout */
const logoutUser = async (req, res, next) => {
  try {
    req.session.destroy(() => {
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  googleLoginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
};