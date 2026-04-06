import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCourses } from "../services/courseService";
import { useAuth } from "../auth/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        const fetchedCourses = response.courses || [];

        setCourses(fetchedCourses);

        const studentCount = fetchedCourses.reduce(
          (sum, course) => sum + (course.totalStudents || 0),
          0
        );

        setTotalStudents(studentCount);
      } catch (error) {
        console.error("Error fetching navbar course data:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 4L36 12V28L20 36L4 28V12L20 4Z"
                stroke="url(#gradientNav)"
                strokeWidth="2"
              />
              <circle cx="20" cy="20" r="3" fill="url(#gradientNav)" />
              <defs>
                <linearGradient
                  id="gradientNav"
                  x1="4"
                  y1="4"
                  x2="36"
                  y2="36"
                >
                  <stop stopColor="#D4AF37" />
                  <stop offset="0.5" stopColor="#4A90E2" />
                  <stop offset="1" stopColor="#2ECC71" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text">
            <h1>GradeForge</h1>
            <span>Academic Excellence Platform</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-actions">
          {/* Stats */}
          <div className="nav-stats">
            <div className="stat-pill">
              <span className="pill-icon">📚</span>
              <span className="pill-text">{courses.length} Courses</span>
            </div>
            <div className="stat-pill">
              <span className="pill-icon">🎓</span>
              <span className="pill-text">{totalStudents} Students</span>
            </div>
          </div>

          {/* User */}
          <div className="user-section">
            <div className="user-avatar">
              <span>
                {user?.role
                  ? user.role.charAt(0).toUpperCase()
                  : "U"}
              </span>
            </div>

            <div className="user-info-text">
              <p className="user-name">
                {user?.role === "professor"
                  ? "Professor"
                  : user?.role === "student"
                  ? "Student"
                  : "User"}
              </p>

              <p className="user-status">
                <span className="status-dot"></span>
                {user ? "Active" : "Offline"}
              </p>
            </div>
          </div>

          {/* Logout */}
          {user && (
            <button className="logout-btn" onClick={handleLogout}>
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;