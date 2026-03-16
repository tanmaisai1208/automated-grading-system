const fs = require("fs").promises;
const path = require("path");

const usersFilePath = path.join(__dirname, "../data/users.json");

/* Read users from file */
const readUsersFromFile = async () => {
  try {
    const data = await fs.readFile(usersFilePath, "utf-8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

/* Write users to file */
const writeUsersToFile = async (users) => {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
};

/* Remove password before sending user to frontend */
const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
  };
};

/* Normal login */
const loginUser = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const users = await readUsersFromFile();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === String(email).toLowerCase() &&
      u.password === password
  );

  if (!user) {
    return null;
  }

  return sanitizeUser(user);
};

/* Google login */
const googleLoginUser = async (name, email) => {
  if (!email) {
    const error = new Error("Email is required for Google login");
    error.status = 400;
    throw error;
  }

  let users = await readUsersFromFile();

  let user = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );

  if (!user) {
    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name: name || "Google User",
      email,
      password: "",
      role: "professor",
      authProvider: "google",
    };

    users.push(newUser);
    await writeUsersToFile(users);
    user = newUser;
  }

  return sanitizeUser(user);
};

/* Get one user */
const getUserByEmail = async (email) => {
  if (!email) return null;

  const users = await readUsersFromFile();

  const user = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );

  return sanitizeUser(user);
};

module.exports = {
  loginUser,
  googleLoginUser,
  getUserByEmail,
};