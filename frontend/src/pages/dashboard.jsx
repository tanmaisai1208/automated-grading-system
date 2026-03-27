import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpModal from "../components/HelpModal";
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { getAllCourses } from "../services/courseService";
import { getStats } from "../services/statsService";
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [avgMarks, setAvgMarks] = useState(0);
  const [avgGrade, setAvgGrade] = useState("--");

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      const fetchedCourses = response.courses || [];

      setCourses(fetchedCourses);

      const studentCount = fetchedCourses.reduce(
        (sum, course) => sum + (course.students?.length || 0),
        0
      );

      setTotalStudents(studentCount);

      // ✅ calculate average marks
      let totals = [];

      fetchedCourses.forEach(course => {
        (course.students || []).forEach(s => {
          if (s.totalMarks !== undefined) {
            totals.push(s.totalMarks);
          }
        });
      });

      if (totals.length > 0) {
        const avg =
          totals.reduce((a, b) => a + b, 0) / totals.length;

        // convert to grade
        let grade = "--";

        if (avg >= 90) grade = "AA";
        else if (avg >= 80) grade = "AB";
        else if (avg >= 70) grade = "BB";
        else if (avg >= 60) grade = "BC";
        else if (avg >= 50) grade = "CC";
        else grade = "DD";

        setAvgGrade(grade);
      }

    } catch (error) {
      console.error(error);
    }
  };

  fetchCourses();
}, []);

  useEffect(() => {

  const fetchStats = async () => {

    try {

      const response = await getStats();

      if (response.stats) {
        setTotalCourses(response.stats.totalCourses);
      }

    } catch (error) {

      console.error("Error fetching stats:", error);

    }

  };

  fetchStats();

}, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div 
          className="mouse-glow" 
          style={{ 
            left: `${mousePosition.x}%`, 
            top: `${mousePosition.y}%` 
          }}
        ></div>
      </div>
      
      {/* Book Pattern Overlay */}
      <div className="book-pattern"></div>
      
      {/* Floating Particles */}
      <div className="particles">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      <Navbar />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-badge">
              <span className="badge-icon">🎓</span>
              <span>Academic Excellence Platform</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Welcome to Your</span>
              <span className="title-main">Academic Dashboard</span>
              <div className="title-underline"></div>
            </h1>
            
            <p className="hero-subtitle">
              Streamline your grading workflow with intelligent automation, comprehensive analytics, 
              and data-driven insights designed specifically for educators.
            </p>

            {/* Stats Cards */}
            <div className="stats-quick-view">
              <div className="stat-card stat-card-1">
                <div className="stat-card-shine"></div>
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M28 10H4V24C4 24.5304 4.21071 25.0391 4.58579 25.4142C4.96086 25.7893 5.46957 26 6 26H26C26.5304 26 27.0391 25.7893 27.4142 25.4142C27.7893 25.0391 28 24.5304 28 24V10Z" stroke="url(#gradStat1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 6V10M11 6V10M4 10H28" stroke="url(#gradStat1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="gradStat1" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#D4AF37"/>
                          <stop offset="1" stopColor="#4A90E2"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Courses</p>
                  <div className="stat-value-wrapper">
                    <p className="stat-value">{totalCourses || courses.length}</p>
                    <span className="stat-trend trend-positive">
                      +{courses.length} this semester
                    </span>
                  </div>
                </div>
                <div className="stat-progress">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="stat-card stat-card-2">
                <div className="stat-card-shine"></div>
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M24 28V25.3333C24 23.9188 23.4381 22.5623 22.4379 21.5621C21.4377 20.5619 20.0812 20 18.6667 20H9.33333C7.91885 20 6.56229 20.5619 5.5621 21.5621C4.5619 22.5623 4 23.9188 4 25.3333V28" stroke="url(#gradStat2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="14" cy="10" r="6" stroke="url(#gradStat2)" strokeWidth="2"/>
                      <path d="M28 28V25.3333C27.9991 24.1411 27.5765 22.9873 26.8039 22.0766C26.0313 21.1658 24.9608 20.5575 23.7867 20.3613" stroke="url(#gradStat2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 4.36133C21.1762 4.55669 22.2487 5.16515 23.0225 6.07697C23.7963 6.98879 24.2195 8.14408 24.2195 9.33799C24.2195 10.5319 23.7963 11.6872 23.0225 12.599C22.2487 13.5108 21.1762 14.1193 20 14.3147" stroke="url(#gradStat2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="gradStat2" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#4A90E2"/>
                          <stop offset="1" stopColor="#2ECC71"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Active Students</p>
                  <div className="stat-value-wrapper">
                    <p className="stat-value">{totalStudents}</p>
                    <span className="stat-trend trend-positive">
                      ↑ {totalStudents} active
                    </span>
                  </div>
                </div>
                <div className="stat-progress">
                  <div className="progress-fill" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="stat-card stat-card-3">
                <div className="stat-card-shine"></div>
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" stroke="url(#gradStat3)" strokeWidth="2"/>
                      <path d="M16 8V16L22 19" stroke="url(#gradStat3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="gradStat3" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#2ECC71"/>
                          <stop offset="1" stopColor="#D4AF37"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Average Grade</p>
                  <div className="stat-value-wrapper">
                    <p className="stat-value">
  {avgMarks ? avgMarks.toFixed(1) : "--"}
</p>

<span className="stat-trend trend-neutral">
  {"Class performance"}
</span>
                  </div>
                </div>
                <div className="stat-progress">
                  <div className="progress-fill" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation Section */}
          <section className="navigation-section">
            <h2 className="section-title">
              <span className="title-icon">📊</span>
              <span className="title-text">Quick Access</span>
            </h2>

            <div className="navigation-cards">
              {/* Card 1 */}
              <div className="nav-card nav-card-primary" onClick={() => handleNavigate('/previous-courses')}>
                <div className="card-shine"></div>
                <div className="card-corner corner-tl"></div>
                <div className="card-corner corner-tr"></div>
                <div className="card-corner corner-bl"></div>
                <div className="card-corner corner-br"></div>
                
                <div className="card-header">
                  <div className="card-icon-wrapper">
                    <div className="card-icon primary">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M40 16H8V36C8 36.5304 8.21071 37.0391 8.58579 37.4142C8.96086 37.7893 9.46957 38 10 38H38C38.5304 38 39.0391 37.7893 39.4142 37.4142C39.7893 37.0391 40 36.5304 40 36V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M32 10V16M16 10V16M8 16H40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="18" cy="26" r="2" fill="currentColor"/>
                        <circle cx="24" cy="26" r="2" fill="currentColor"/>
                        <circle cx="30" cy="26" r="2" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <div className="card-badge badge-primary">Archive</div>
                </div>

                <div className="card-body">
                  <h3 className="card-title">Previous Courses</h3>
                  <p className="card-description">
                    Access comprehensive historical data, uploaded marksheets, and final grade 
                    reports from past academic semesters and years.
                  </p>

                  <div className="card-features">
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Course History</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Grade Reports</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Analytics Archive</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="card-action-btn">
                    <span>View Archives</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="card-meta">
                    <span>{totalCourses || courses.length} Courses</span>
                    <span className="meta-separator">•</span>
                    <span>{totalStudents} Students</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="nav-card nav-card-secondary" onClick={() => handleNavigate('/upload-marks')}>
                <div className="card-shine"></div>
                <div className="card-corner corner-tl"></div>
                <div className="card-corner corner-tr"></div>
                <div className="card-corner corner-bl"></div>
                <div className="card-corner corner-br"></div>
                
                <div className="card-header">
                  <div className="card-icon-wrapper">
                    <div className="card-icon secondary">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M40 30V36C40 36.5304 39.7893 37.0391 39.4142 37.4142C39.0391 37.7893 38.5304 38 38 38H10C9.46957 38 8.96086 37.7893 8.58579 37.4142C8.21071 37.0391 8 36.5304 8 36V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M32 16L24 8L16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M24 8V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="card-badge badge-secondary">New</div>
                </div>

                <div className="card-body">
                  <h3 className="card-title">Upload New Course</h3>
                  <p className="card-description">
                    Begin grading process by uploading student marks for a new course and 
                    generate automated grade distributions with intelligent analytics.
                  </p>

                  <div className="card-features">
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Excel Upload</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Auto Grading</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Statistical Analysis</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="card-action-btn">
                    <span>Upload Marks</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="card-meta">
                    <span>Quick Process</span>
                    <span className="meta-separator">•</span>
                    <span>Instant Results</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Help Section */}
          <section className="help-section">
            <div className="help-card">
              <div className="help-glow"></div>
              
              <div className="help-content">
                <div className="help-icon">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M28 20V28L34 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="28" cy="28" r="3" fill="currentColor"/>
                  </svg>
                </div>
                
                <div className="help-text">
                  <h3>Need Assistance?</h3>
                  <p>Access our comprehensive documentation, video tutorials, and dedicated support resources to make the most of your grading platform.</p>
                </div>

                <button className="help-button" onClick={() => setShowHelp(true)}>
                  <span>View Documentation</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
};

export default Dashboard;
