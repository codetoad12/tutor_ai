import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import NewsCard from './NewsCard';
import { FaBookmark, FaRegBookmark, FaChartLine, FaQuestionCircle, FaSearch, FaCalendarAlt } from 'react-icons/fa';

function MainContent() {
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [filteredAffairs, setFilteredAffairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookmarkedAffairs, setBookmarkedAffairs] = useState([]);

  // Static trending topics data
  const trendingTopics = [
    { name: 'UPSC Prelims 2024', count: 45 },
    { name: 'Indian Economy', count: 32 },
    { name: 'International Relations', count: 28 },
    { name: 'Environment & Ecology', count: 25 },
    { name: 'Science & Technology', count: 22 },
    { name: 'Polity & Governance', count: 20 },
    { name: 'Social Issues', count: 18 },
    { name: 'History & Culture', count: 15 }
  ];

  // Static categories
  const categories = [
    'Polity',
    'Economy',
    'International Relations',
    'Environment',
    'Science & Technology',
    'Social Issues',
    'Security',
    'Miscellaneous'
  ];

  useEffect(() => {
    const fetchCurrentAffairs = async () => {
      try {
        if (!authService.isAuthenticated()) {
          window.location.href = '/login';
          return;
        }

        const headers = authService.getAuthHeaders();
        const response = await fetch('http://localhost:8000/api/current-affairs/', {
          headers: headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            authService.logout();
            return;
          }
          throw new Error('Failed to fetch current affairs');
        }

        const data = await response.json();
        setCurrentAffairs(data);
        setFilteredAffairs(data);
      } catch (err) {
        console.error('Error fetching current affairs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentAffairs();
  }, []);

  useEffect(() => {
    let filtered = [...currentAffairs];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(affair => affair.category === filters.category);
    }

    // Apply date filter
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(affair => affair.date.startsWith(dateStr));
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(affair => 
        affair.title.toLowerCase().includes(searchLower) ||
        affair.summary.toLowerCase().includes(searchLower) ||
        affair.key_concepts?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAffairs(filtered);
  }, [currentAffairs, filters, selectedDate]);

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  const handleDateChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setSelectedDate(date);
  };

  const handleBookmark = (affair) => {
    setBookmarkedAffairs(prev => {
      const isBookmarked = prev.some(a => a.id === affair.id);
      if (isBookmarked) {
        return prev.filter(a => a.id !== affair.id);
      } else {
        return [...prev, affair];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-3 text-center">
              <h2 className="text-lg font-serif font-medium text-gray-700">Find relevant current affairs for your UPSC preparation</h2>
            </div>
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">
                <FaSearch className="text-xl" />
              </div>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search by topic or keyword..."
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base tracking-tight bg-white shadow-sm hover:shadow-md transition-all"
                  value={filters.search}
                  onChange={handleSearch}
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-blue-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main News Column */}
          <div className="order-2 lg:order-1 lg:col-span-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-600 text-base tracking-tight">Loading current affairs...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 text-base tracking-tight">{error}</p>
              </div>
            ) : (
              <div>
                {filteredAffairs.length > 0 ? (
                  <>
                    <div style={{ marginBottom: '40px' }} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-wrap justify-between items-center shadow-sm">
                      <p className="text-gray-700 text-base">
                        {filteredAffairs.length === 1 ? (
                          <span className="font-serif font-medium">Discover 1 important story for your UPSC preparation today</span>
                        ) : (
                          <span className="font-serif font-medium">Explore {filteredAffairs.length} crucial updates for UPSC aspirants</span>
                        )}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3 md:mt-0 flex-wrap">
                        {filters.category && (
                          <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <span className="text-sm text-gray-700 mr-2">Category:</span>
                            <span className="text-blue-700 text-sm font-medium">
                              {filters.category}
                            </span>
                            <button 
                              onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        
                        {selectedDate && (
                          <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <span className="text-sm text-gray-700 mr-2">Date:</span>
                            <span className="text-blue-700 text-sm font-medium">
                              {selectedDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <button 
                              onClick={() => setSelectedDate(null)}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        
                        {(filters.category || filters.search || selectedDate) && (
                          <button
                            onClick={() => {
                              setFilters({ category: '', search: '' });
                              setSelectedDate(null);
                            }}
                            className="text-sm text-blue-700 hover:text-blue-900 underline"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {filteredAffairs.map((affair, index) => (
                      <div key={affair.id} style={{ marginBottom: index < filteredAffairs.length - 1 ? '40px' : '0' }}>
                        <NewsCard 
                          currentAffair={affair}
                          isBookmarked={bookmarkedAffairs.some(a => a.id === affair.id)}
                          onBookmark={() => handleBookmark(affair)}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <p className="text-gray-700 text-lg mb-4">No current affairs found with the current filters.</p>
                    <button
                      onClick={() => {
                        setFilters({ category: '', search: '' });
                        setSelectedDate(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="order-1 lg:order-2 lg:col-span-4">
            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4 font-serif">Categories</h3>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category} className="group">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, category }))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.category === category 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trending Topics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FaChartLine className="text-red-600" />
                <h3 className="text-lg font-medium text-gray-800 font-serif">Trending Topics</h3>
              </div>
              <ul className="space-y-3">
                {trendingTopics.map(topic => (
                  <li key={topic.name} className="group">
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, search: topic.name }))}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg group-hover:shadow-sm transition-all"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-blue-700">{topic.name}</span>
                      <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border border-gray-200 group-hover:border-blue-200 group-hover:text-blue-600">
                        {topic.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainContent; 