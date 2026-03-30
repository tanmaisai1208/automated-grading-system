const BASE_URL = "http://localhost:5000/api/auth";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Authentication request failed");
  }

  return data;
};

/* LOGIN */
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 🔥 REQUIRED for session cookie
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};

/* GOOGLE LOGIN */
export const googleLoginUser = async (name, email) => {
  const response = await fetch(`${BASE_URL}/google-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 🔥 REQUIRED
    body: JSON.stringify({ name, email }),
  });

  return handleResponse(response);
};

/* LOGOUT */
export const logoutUser = async () => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include", // 🔥 REQUIRED (to destroy correct session)
  });

  return handleResponse(response);
};

/* GET CURRENT USER */
export const getCurrentUser = async (email) => {
  const response = await fetch(
    `${BASE_URL}/me?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      credentials: "include", // 🔥 IMPORTANT for session-based auth
    }
  );

  return handleResponse(response);
};