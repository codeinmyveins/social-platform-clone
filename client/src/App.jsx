import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';

import AuthProvider from './AuthProvider.jsx';
import { useAuth } from './auth.js';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Feed from './pages/Feed.jsx';
import NewPost from './pages/NewPost.jsx';
import MyPosts from './pages/MyPosts.jsx';
import Profile from './pages/Profile.jsx';
import Users from './pages/Users.jsx';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">
          X Social
        </Link>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Feed
          </NavLink>
          <NavLink to="/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            New Post
          </NavLink>
          <NavLink to="/my-posts" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            My Posts
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Users
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Profile
          </NavLink>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-chip">Hi, {user.name}</span>
              <button type="button" className="button button--ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button--ghost">
                Login
              </Link>
              <Link to="/signup" className="button">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="app-shell">
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/new"
              element={
                <PrivateRoute>
                  <NewPost />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-posts"
              element={
                <PrivateRoute>
                  <MyPosts />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
