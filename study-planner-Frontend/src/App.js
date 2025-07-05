import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
// import Dashboard from './Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './Dashboard'
import './App.css'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange)
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login';
  }

  return (
    <Router>
      <nav className="navbar">
        <div className="nav-left">
          {/* <Link className="nav-link" to="/">Home</Link> */}
          <Link className="nav-link" to="/">Dashboard</Link>
          {/* {isLoggedIn && <Link className="nav-link" to="/dashboard">Dashboard</Link>} */}
          {!isLoggedIn && (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          )}
        </div>
        {isLoggedIn && (
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        )}
      </nav>

      <div className="content">
        <Routes>
          {/* <Route path="/" element={<h1 className="home-title">Welcome to Smart Study Planner</h1>} /> */}
          {/* <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />} /> */}
          <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} />
          <Route path="/register" element={!isLoggedIn ? <Register setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
