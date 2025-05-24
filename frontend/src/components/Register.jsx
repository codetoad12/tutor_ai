import React, { useState } from 'react';
import { authService } from '../services/auth';
import { FaUser, FaLock, FaSpinner, FaGraduationCap, FaEnvelope, FaUserPlus, FaRobot } from 'react-icons/fa';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username && !formData.email) {
      setError('Please provide either a username or email');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        password2: formData.confirmPassword
      };

      await authService.register(registrationData);
      onRegister();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="bg-notebook min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
            <h2 className="text-2xl font-bold text-chalkboard mb-2">Begin Your Learning Adventure!</h2>
            <p className="text-sm text-gray-600">Join our community of learners and unlock your potential</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-xs text-center mb-4 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span className="mr-2">Username</span>
                <div className="flex-grow border-b border-gray-200"></div>
              </label>
              <div className="relative">
                <div className="absolute -left-7 flex items-center pointer-events-none">
                  <FaUser className="text-sm text-accent-blue" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="pl-3 pr-3 py-2.5 w-full text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span className="mr-2">Email Address</span>
                <div className="flex-grow border-b border-gray-200"></div>
              </label>
              <div className="relative">
                <div className="absolute -left-7 flex items-center pointer-events-none">
                  <FaEnvelope className="text-sm text-accent-blue" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-3 pr-3 py-2.5 w-full text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="your@email.com"
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-3 pr-3 py-2.5 w-full text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span className="mr-2">Confirm Password</span>
                <div className="flex-grow border-b border-gray-200"></div>
              </label>
              <div className="relative">
                <div className="absolute -left-7 flex items-center pointer-events-none">
                  <FaLock className="text-sm text-accent-blue" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-3 pr-3 py-2.5 w-full text-sm rounded-md border border-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue bg-gray-50"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-blue text-white py-3 px-4 rounded-lg hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Creating your account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaUserPlus className="mr-2" />
                  Create My Learning Account
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-gray-500 bg-white">Already part of our community?</span>
              </div>
            </div>
            <p className="mt-4 text-sm">
              <button 
                onClick={() => onRegister()}
                className="text-accent-blue hover:text-accent-blue-dark font-medium inline-flex items-center transition-colors duration-200"
              >
                <FaGraduationCap className="mr-2" />
                Sign in to your classroom
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 