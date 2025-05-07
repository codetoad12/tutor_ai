import React from 'react';
import { FaBookmark, FaRegBookmark, FaCalendarAlt } from 'react-icons/fa';

function NewsCard({ currentAffair, isBookmarked, onBookmark }) {
  return (
    <article 
      id={`affair-${currentAffair.id}`} 
      className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mb-6"
    >
      <div className="p-8 sm:p-10">
        {/* Header with title and bookmark */}
        <div className="flex justify-between items-start gap-6 mb-8">
          <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight leading-relaxed">
            {currentAffair.title}
          </h2>
          <button 
            onClick={onBookmark}
            className="text-gray-400 hover:text-blue-700 transition-colors duration-200 flex-shrink-0 p-1.5"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? <FaBookmark className="text-blue-700 text-xl" /> : <FaRegBookmark className="text-xl" />}
          </button>
        </div>

        {/* Category badge */}
        <div className="mb-8">
          <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold shadow-sm hover:bg-blue-100 transition-colors">
            {currentAffair.category}
          </span>
        </div>

        {/* Meta information with better spacing and icons */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600 tracking-tight">
          <span className="flex items-center text-gray-500 space-x-3">
            <FaCalendarAlt className="text-blue-600" />
            <span>{new Date(currentAffair.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </span>
          {currentAffair.source && (
            <span className="text-gray-500 flex items-center space-x-3">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
              <span>Source: {currentAffair.source}</span>
            </span>
          )}
        </div>

        {/* Summary with better readability */}
        <div className="prose max-w-none mb-10">
          <p className="text-base text-gray-700 leading-relaxed tracking-tight">
            {currentAffair.summary}
          </p>
        </div>

        {/* AI Insight Box with improved styling */}
        {currentAffair.ai_insight && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-700 p-7 mb-10 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-700">
                  <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 16h2v2h-2zm0-12h2v10h-2z" />
                </svg>
              </div>
              <div className="ml-6">
                <h3 className="text-base font-serif font-medium text-blue-700 tracking-tight">UPSC Expert Insight</h3>
                <div className="mt-3 text-base text-gray-700 tracking-tight">
                  <p className="italic">{currentAffair.ai_insight}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags with better spacing and styling */}
        {currentAffair.tags && currentAffair.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-4">Related Topics:</p>
            <div className="flex flex-wrap gap-6">
              {currentAffair.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-100 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default NewsCard; 