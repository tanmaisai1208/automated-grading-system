// import React, { createContext, useContext, useState } from "react";
// import {
//   loginUser as loginUserApi,
//   googleLoginUser as googleLoginUserApi,
//   logoutUser as logoutUserApi,
// } from "../services/authService";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(
//     JSON.parse(localStorage.getItem("user"))
//   );

//   const login = async (email, password) => {
//     const response = await loginUserApi(email, password);
//     setUser(response.user);
//     localStorage.setItem("user", JSON.stringify(response.user));
//     return response.user;
//   };

//   const googleLogin = async (name, email) => {
//     const response = await googleLoginUserApi(name, email);
//     setUser(response.user);
//     localStorage.setItem("user", JSON.stringify(response.user));
//     return response.user;
//   };

//   const logout = async () => {
//     try {
//       await logoutUserApi();
//     } catch (error) {
//       console.error("Logout API error:", error);
//     }

//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, googleLogin, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser as loginUserApi,
  registerUser as registerUserApi,
  googleLoginUser as googleLoginUserApi,
  logoutUser as logoutUserApi,
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Invalid user in localStorage');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email, password) => {
    const response = await loginUserApi(email, password);

    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response.user;
  };

  const register = async (userData) => {
    const response = await registerUserApi(userData);
    return response.user;
  };

  const googleLogin = async (name, email) => {
    const response = await googleLoginUserApi(name, email);

    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response.user;
  };

  const logout = async () => {
    try {
      await logoutUserApi();
    } catch (error) {
      console.error('Logout API error:', error);
    }

    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}