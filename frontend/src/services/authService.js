const BASE_URL = "http://localhost:5000/api/auth";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Authentication request failed");
  }

  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};

export const googleLoginUser = async (name, email) => {
  const response = await fetch(`${BASE_URL}/google-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  return handleResponse(response);
};

export const logoutUser = async () => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
  });

  return handleResponse(response);
};

export const getCurrentUser = async (email) => {
  const response = await fetch(`${BASE_URL}/me?email=${encodeURIComponent(email)}`);
  return handleResponse(response);
};