import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { useAuth } from '../auth/AuthContext';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    rollNo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value === 'professor' ? { rollNo: '' } : {}),
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      rollNo,
    } = formData;

    if (!name || !email || !password || !confirmPassword || !role) {
      alert('Please fill all required fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (role === 'student' && !rollNo.trim()) {
      alert('Roll number is required for student registration');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        role,
        rollNo: role === 'student' ? rollNo : '',
      });

      alert('Registration successful. Please login.');
      navigate('/login');
    } catch (error) {
      alert(error.message || 'Registration failed');
    }
  };

  return (
    <div className="register-wrapper">
      <Navbar />

      <main className="register-main">
        <div className="register-container">
          <h1 className="page-title">Create Account</h1>

          <p className="page-subtitle">
            Register to access the Automated Grading System
          </p>

          <section className="register-card">
            <form
              onSubmit={handleRegister}
              className="register-form"
            >
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </select>

              {formData.role === 'student' && (
                <input
                  type="text"
                  name="rollNo"
                  placeholder="Roll Number"
                  value={formData.rollNo}
                  onChange={handleChange}
                />
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="primary-btn"
              >
                Register
              </button>
            </form>

            <div className="register-link-text">
              <span>Already have an account? </span>
              <Link to="/login">Login</Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}