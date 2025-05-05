import React from 'react';

function NewsCard({ currentAffair }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm text-gray-500">{currentAffair.date}</span>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {currentAffair.category}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-3">{currentAffair.title}</h3>
      <p className="text-gray-700 mb-4">{currentAffair.summary}</p>
      {currentAffair.key_concepts && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Concepts:</h4>
          <p className="text-sm text-gray-600">{currentAffair.key_concepts}</p>
        </div>
      )}
      {currentAffair.usage_hint && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Usage Hint:</h4>
          <p className="text-sm text-gray-600">{currentAffair.usage_hint}</p>
        </div>
      )}
    </div>
  );
}

export default NewsCard; 