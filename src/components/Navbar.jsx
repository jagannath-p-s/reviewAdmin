import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link to="/">Admin Dashboard</Link>
        </div>
        <div className="flex space-x-4">
          <Link to="/admin-panel" className="hover:text-gray-200">Admin Panel</Link>
          <Link to="/analytics" className="hover:text-gray-200">Analytics</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
