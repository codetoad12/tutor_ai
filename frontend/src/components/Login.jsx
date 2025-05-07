import React, { useState } from 'react';
import { authService } from '../services/auth';
import { FaUser, FaLock, FaSpinner, FaGraduationCap, FaBook, FaPencilAlt, FaRobot } from 'react-icons/fa';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(credentials.username, credentials.password);
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      onLogin();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-notebook min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full">
        {/* TUTOR AI Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <FaRobot className="w-8 h-8 text-accent-blue" />
            <h1 className="text-4xl font-bold text-accent-blue tracking-wider font-serif">
              TUTOR AI
            </h1>
          </div>
          <div className="h-1 w-24 bg-accent-blue mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-xl shadow-chalkboard p-8 border-t-4 border-accent-blue">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-chalkboard mb-2">Welcome to Your Learning Journey!</h2>
            <p className="text-sm text-gray-600">Where every login is a step towards knowledge</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-xs text-center mb-4 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span className="mr-2">Username or Email</span>
                <div className="flex-grow border-b border-gray-200"></div>
              </label>
              <div className="relative">
                <div className="absolute -left-7 flex items-center pointer-events-none">
                  <FaUser className="text-sm text-accent-blue" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="pl-3 pr-3 py-2.5 w-full text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="Enter your username or email"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span className="mr-2">Password</span>
                <div className="flex-grow border-b border-gray-200"></div>
              </label>
              <div className="relative">
                <div className="absolute -left-7 flex items-center pointer-events-none">
                  <FaLock className="text-sm text-accent-blue" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-3 pr-3 py-2.5 w-full text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={credentials.rememberMe}
                  onChange={(e) => setCredentials({ ...credentials, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-accent-blue focus:ring-1 focus:ring-accent-blue border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-accent-blue hover:text-accent-blue-dark font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-blue text-white py-3 px-4 rounded-lg hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Opening your classroom...
                </div>
              ) : (
                'Start Learning'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-gray-500 bg-white">New to our classroom?</span>
              </div>
            </div>
            <p className="mt-4 text-sm">
              <a href="register.html" className="text-accent-blue hover:text-accent-blue-dark font-medium inline-flex items-center">
                <FaGraduationCap className="mr-2" />
                Begin Your Learning Adventure
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 