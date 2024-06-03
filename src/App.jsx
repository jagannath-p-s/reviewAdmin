import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import Analytics from './components/Analytics'; // Import the Analytics component
import Navbar from './components/Navbar'; // Import the Navbar component

function App() {
  return (
    <Router>
      <Navbar /> {/* Add the Navbar component */}
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route element={<PrivateRoute />}>
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/analytics" element={<Analytics />} /> {/* Add route for Analytics */}
        </Route>
        <Route path="*" element={<Navigate to="/admin-login" />} />
      </Routes>
    </Router>
  );
}

export default App;
