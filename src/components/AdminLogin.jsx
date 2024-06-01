import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('useremail', email)
      .single();

    if (error) {
      setError('Invalid login credentials');
      return;
    }

    if (data && data.password === password) {
      // Save session token or similar in localStorage
      localStorage.setItem('adminLoggedIn', 'true');
      navigate('/admin-panel'); // Redirect to admin panel
    } else {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
      <form onSubmit={handleLogin} className="max-w-md mx-auto bg-white p-8 border border-gray-300 rounded-lg">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email:</label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password:</label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-150">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
