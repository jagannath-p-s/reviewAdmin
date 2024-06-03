import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Analytics from './components/Analytics';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  const location = useLocation();

  const showNavbar = location.pathname !== '/admin-login';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route element={<PrivateRoute />}>
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin-login" />} />
      </Routes>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
