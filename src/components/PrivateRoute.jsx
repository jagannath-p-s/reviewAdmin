import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Instead of checking for a string, ensure that the string is exactly "true"
  const isAuthenticated = localStorage.getItem('adminLoggedIn') === 'true';

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default PrivateRoute;
