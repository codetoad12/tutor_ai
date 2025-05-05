import React from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

function NewsCard({ currentAffair, isBookmarked, onBookmark }) {
  return (
    <article 
      id={`affair-${currentAffair.id}`} 
      className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 min-h-[150px]"
    >
      <div className="p-6">
        {/* Header with title and bookmark */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight pr-4">
            {currentAffair.title}
          </h2>
          <button 
            onClick={onBookmark}
            className="text-gray-400 hover:text-blue-700 transition-colors duration-200 flex-shrink-0"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? <FaBookmark className="text-blue-700" /> : <FaRegBookmark />}
          </button>
        </div>

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 tracking-tight">
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium border border-blue-200">
            {currentAffair.category}
          </span>
          <span className="text-gray-500">
            {new Date(currentAffair.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          {currentAffair.source && (
            <span className="text-gray-500">
              • {currentAffair.source}
            </span>
          )}
        </div>

        {/* Summary */}
        <div className="prose max-w-none mb-6">
          <p className="text-base text-gray-700 leading-relaxed tracking-tight">
            {currentAffair.summary}
          </p>
        </div>

        {/* AI Insight Box */}
        {currentAffair.ai_insight && (
          <div className="bg-blue-50 border-l-4 border-blue-700 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-blue-700 tracking-tight">AI Insight</h3>
                <div className="mt-2 text-base text-gray-700 tracking-tight">
                  <p>{currentAffair.ai_insight}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {currentAffair.tags && currentAffair.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {currentAffair.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm border border-blue-200 tracking-tight"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default NewsCard; 