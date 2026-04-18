import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Enter credentials');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const googleEmail = prompt('Enter your institute Google email:');
      if (!googleEmail) return;

      const googleName = prompt('Enter your name:');
      await googleLogin(googleName || 'Google User', googleEmail);

      navigate('/dashboard');
    } catch (error) {
      alert(error.message || 'Google login failed');
    }
  };

  return (
    <div className="login-wrapper">
      <Navbar />

      <main className="login-main">
        <div className="login-container">
          <h1 className="page-title">Welcome Back</h1>
          <p className="page-subtitle">
            Sign in to access the Automated Grading System
          </p>

          <section className="login-card">
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" className="primary-btn">
                Sign In
              </button>
            </form>

            <div className="register-text">
              <span>Don&apos;t have an account?</span>
              <Link to="/register">Register</Link>
            </div>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              className="google-btn"
              onClick={handleGoogleLogin}
            >
              <svg
                className="google-icon"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.64 2.3 30.2 0 24 0 14.64 0 6.6 5.4 2.56 13.28l7.98 6.2C12.3 13.4 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.1 24.5c0-1.64-.15-3.2-.42-4.7H24v9h12.4c-.54 2.9-2.18 5.35-4.65 7l7.2 5.6c4.2-3.87 6.65-9.6 6.65-16.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.54 28.48a14.5 14.5 0 010-8.96l-7.98-6.2A23.96 23.96 0 000 24c0 3.86.92 7.5 2.56 10.68l7.98-6.2z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.9-2.14 15.87-5.82l-7.2-5.6c-2 1.35-4.56 2.14-8.67 2.14-6.3 0-11.7-3.9-13.46-9.28l-7.98 6.2C6.6 42.6 14.64 48 24 48z"
                />
              </svg>

              Continue with Institute Mail ID
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}