import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaCalendarAlt, FaNewspaper, FaSearch, FaHome, FaBook, FaChartLine, FaComments } from 'react-icons/fa';

function Header({ onLogout, selectedDate, onDateChange }) {
  const location = useLocation();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <FaNewspaper className="text-2xl text-blue-700" />
            <span className="text-sm font-medium text-gray-700">{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-blue-50 rounded-lg p-2 border border-blue-100 hover:bg-blue-100 transition-colors">
              <FaCalendarAlt className="text-blue-700 mr-2 ml-1" />
              <input 
                type="date" 
                id="date-picker" 
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : today.toISOString().split('T')[0]}
                onChange={onDateChange}
                className="bg-transparent border-none text-gray-700 focus:outline-none focus:ring-0 text-sm"
                aria-label="Filter by date"
              />
              {selectedDate && (
                <button 
                  onClick={() => onDateChange({ target: { value: '' } })}
                  className="ml-2 text-xs text-blue-700 hover:text-blue-900"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors duration-200 text-sm text-white shadow-sm"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="flex flex-col items-center justify-center py-6 border-t border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-blue-700">
              <Link to="/">AI Tutor</Link>
            </h1>
            <p className="text-gray-600 text-sm mt-2 italic">
              Curated Current Affairs for UPSC Aspirants
            </p>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center justify-center space-x-8">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaHome />
              <span>Home</span>
            </Link>
            <Link 
              to="/current-affairs" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/current-affairs') ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaChartLine />
              <span>Current Affairs</span>
            </Link>
            <Link 
              to="/news" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/news') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaNewspaper />
              <span>News</span>
            </Link>
            <Link 
              to="/daily-brief" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/daily-brief') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaBook />
              <span>Daily Brief</span>
            </Link>
            <Link 
              to="/chat" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/chat') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaComments />
              <span>Chat</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 