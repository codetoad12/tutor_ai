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
    <header className="bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="container mx-auto px-3 py-2">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaNewspaper className="text-lg text-blue-700" />
            <span className="text-xs font-medium text-gray-700">{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-blue-50 rounded-lg p-1 border border-blue-100 hover:bg-blue-100 transition-colors">
              <FaCalendarAlt className="text-blue-700 mr-1 ml-1 text-xs" />
              <input 
                type="date" 
                id="date-picker" 
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : today.toISOString().split('T')[0]}
                onChange={onDateChange}
                className="bg-transparent border-none text-gray-700 focus:outline-none focus:ring-0 text-xs py-1 w-auto"
                aria-label="Filter by date"
              />
              {selectedDate && (
                <button 
                  onClick={() => onDateChange({ target: { value: '' } })}
                  className="ml-1 text-xs text-blue-700 hover:text-blue-900"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors duration-200 text-xs text-white shadow-sm"
            >
              <FaSignOutAlt className="text-xs" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Main Header - Centered Title */}
        <div className="flex flex-col items-center border-t border-gray-200 mt-2 pt-2">
          <div className="text-center mb-2">
            <h1 className="text-xl font-serif font-bold tracking-tight text-blue-700">
              <Link to="/">AI Tutor</Link>
            </h1>
            <p className="text-gray-600 text-xs italic">
              Curated Current Affairs
            </p>
          </div>
          
          {/* Navigation - Below Title */}
          <nav className="flex items-center justify-center space-x-3 pb-1">
            <Link 
              to="/" 
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaHome className="text-xs" />
              <span>Home</span>
            </Link>
            <Link 
              to="/current-affairs" 
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                isActive('/current-affairs') ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaChartLine className="text-xs" />
              <span>Current Affairs</span>
            </Link>
            <Link 
              to="/news" 
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                isActive('/news') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaNewspaper className="text-xs" />
              <span>News</span>
            </Link>
            <Link 
              to="/daily-brief" 
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                isActive('/daily-brief') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaBook className="text-xs" />
              <span>Daily Brief</span>
            </Link>
            <Link 
              to="/chat" 
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                isActive('/chat') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <FaComments className="text-xs" />
              <span>Chat</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 