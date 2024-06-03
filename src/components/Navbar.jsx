import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from "react-icons/fa";
import 'tailwindcss/tailwind.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin-login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 shadow-md fixed w-full z-20">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
        <div className="text-2xl font-bold tracking-wide">
          <p>Admin Dashboard</p>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/admin-panel" className="hover:text-gray-300 transition duration-300">Admin Panel</Link>
          <Link to="/analytics" className="hover:text-gray-300 transition duration-300">Analytics</Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <FaBars size={24} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-800 mt-4 z-20 absolute w-full">
          <div className="flex flex-col items-center space-y-4 py-4">
            <Link to="/admin-panel" className="block text-center hover:text-gray-300 transition duration-300">Admin Panel</Link>
            <Link to="/analytics" className="block text-center hover:text-gray-300 transition duration-300">Analytics</Link>
            <button
              onClick={handleLogout}
              className=" text-center bg-red-500 hover:bg-red-600 text-white px-24   md:px-4 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
