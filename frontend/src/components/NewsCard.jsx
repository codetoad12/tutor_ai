import React from 'react';
import { FaBookmark, FaRegBookmark, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';

function NewsCard({ currentAffair, isBookmarked, onBookmark }) {
  // Render stars based on importance (1-5)
  const renderImportanceStars = (importance) => {
    // Make sure importance is a number
    const numImportance = Number(importance) || 0;
    // Ensure it's within the 1-5 range
    const starCount = Math.min(Math.max(numImportance, 0), 5);
    
    return (
      <div className="flex items-center mb-4">
        <div className="flex text-sm text-yellow-500 bg-yellow-50 p-2 rounded border border-yellow-200">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="inline-block">
              {i < starCount ? (
                <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            </span>
          ))}
          <span className="ml-1 text-gray-600 font-bold">({starCount}/5)</span>
        </div>
      </div>
    );
  };

  return (
    <article 
      id={`affair-${currentAffair.id}`} 
      className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Header with category badge */}
      <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold shadow-sm">
          {currentAffair.category}
        </span>
        
        <button 
          onClick={onBookmark}
          className="text-gray-400 hover:text-blue-700 transition-colors duration-200 flex-shrink-0 p-1.5"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? <FaBookmark className="text-blue-700 text-xl" /> : <FaRegBookmark className="text-xl" />}
        </button>
      </div>
      
      <div className="p-8">
        {/* Main title */}
        <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight leading-relaxed mb-4">
          {currentAffair.article_link ? (
            <a 
              href={currentAffair.article_link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 flex items-center"
            >
              {currentAffair.title}
              <svg className="h-4 w-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            currentAffair.title
          )}
        </h2>
        
        {/* Importance stars right below the headline */}
        {currentAffair.importance !== null && currentAffair.importance !== undefined && (
          <div className="flex items-center mb-4">
            <div className="flex text-sm text-yellow-500 bg-yellow-50 p-2 rounded border border-yellow-200">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="inline-block">
                  {i < currentAffair.importance ? (
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                </span>
              ))}
              <span className="ml-1 text-gray-600 font-bold">({currentAffair.importance}/5)</span>
            </div>
          </div>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
          {/* Date */}
          <div className="flex items-center gap-2 text-gray-500">
            <FaCalendarAlt className="text-blue-600 text-xs" />
            {new Date(currentAffair.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          
          {/* Source */}
          {currentAffair.source && (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              Source: {currentAffair.source}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mb-6 prose max-w-none">
          <p className="text-base text-gray-700 leading-relaxed tracking-tight whitespace-pre-line">
            {currentAffair.summary}
          </p>
        </div>

        {/* AI Insight Box */}
        {(currentAffair.ai_insights || currentAffair.ai_insight || currentAffair.syllabus_connection) && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-700 p-5 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-700">
                  <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 16h2v2h-2zm0-12h2v10h-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-serif font-medium text-blue-700 tracking-tight">Concepts Highlighted</h3>
                <div className="mt-2 text-gray-700">
                  {currentAffair.ai_insights && (
                    <p className="text-sm">{currentAffair.ai_insights}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {currentAffair.tags && currentAffair.tags.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Related Topics:</p>
            <div className="flex flex-wrap gap-2">
              {currentAffair.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium shadow-sm hover:bg-gray-100 transition-colors"
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