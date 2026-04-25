const BASE_URL = '/api/auth';

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed');
  }

  return data;
};

/* LOGIN */
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};

/* REGISTER */
export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

/* GOOGLE LOGIN */
export const googleLoginUser = async (name, email) => {
  const response = await fetch(`${BASE_URL}/google-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name, email }),
  });

  return handleResponse(response);
};

/* LOGOUT */
export const logoutUser = async () => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  return handleResponse(response);
};

/* GET CURRENT USER */
export const getCurrentUser = async () => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    credentials: 'include',
  });

  return handleResponse(response);
};