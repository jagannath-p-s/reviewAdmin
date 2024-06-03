import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('useremail', email)
      .single();

    setLoading(false);

    if (error) {
      setError('Invalid login credentials');
      return;
    }

    if (data && data.password === password) {
      localStorage.setItem('adminLoggedIn', 'true');
      navigate('/admin-panel');
    } else {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="container max-w-md mx-auto p-4 sm:p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="text-red-600">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded mt-1 focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded mt-1 focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className={`w-full p-3 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white transition-colors duration-150 hover:bg-blue-600 focus:outline-none`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
