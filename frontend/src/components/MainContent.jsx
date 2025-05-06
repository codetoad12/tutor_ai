import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import NewsCard from './NewsCard';
import Header from './Header';
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

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onLogout={handleLogout}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

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
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main News Column */}
          <div className="lg:col-span-8">
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
              <div className="space-y-6">
                {filteredAffairs.length > 0 ? (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 flex flex-wrap justify-between items-center shadow-sm">
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
                    
                    {filteredAffairs.map((affair) => (
                      <NewsCard 
                        key={affair.id} 
                        currentAffair={affair}
                        isBookmarked={bookmarkedAffairs.some(a => a.id === affair.id)}
                        onBookmark={() => handleBookmark(affair)}
                      />
                    ))}
                  </>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-base tracking-tight">
                      No current affairs found matching your filters.
                    </p>
                    <button
                      onClick={() => {
                        setFilters({ category: '', search: '' });
                        setSelectedDate(null);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Weekly Quiz Button */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-serif font-semibold text-blue-700">Test Your Knowledge</h3>
                <p className="text-sm text-gray-600 mt-1">Challenge yourself with questions on recent current affairs</p>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center justify-center gap-3 text-base font-medium tracking-tight group">
                <FaQuestionCircle className="text-lg group-hover:animate-pulse" />
                <span>Start Weekly Quiz</span>
              </button>
            </div>

            {/* Trending Topics */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 hover:shadow-md transition-all duration-300">
              <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight mb-5 flex items-center">
                <FaChartLine className="text-blue-700 mr-3" />
                <span>Trending Topics</span>
              </h2>
              
              <div className="space-y-4">
                {/* Topics by popularity */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-3">By Popularity</p>
                  <div className="flex flex-wrap gap-3">
                    {trendingTopics
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((topic, index) => {
                        // Calculate intensity for the most popular topics
                        const maxCount = Math.max(...trendingTopics.map(t => t.count));
                        const intensity = (topic.count / maxCount) * 100;
                        const isHot = intensity > 70;
                        
                        return (
                          <span
                            key={index}
                            className={`px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 cursor-pointer transition-colors tracking-tight border border-blue-100 flex items-center ${isHot ? 'border-red-200 bg-gradient-to-r from-blue-50 to-red-50' : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, search: topic.name }))}
                          >
                            <span>{topic.name}</span>
                            <span className={`ml-2 ${isHot ? 'bg-gradient-to-r from-blue-700 to-red-600' : 'bg-blue-700'} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center`}>{topic.count}</span>
                            {isHot && <span className="ml-1 text-red-500 text-xs">🔥</span>}
                          </span>
                        );
                      })
                    }
                  </div>
                </div>
                
                {/* Categories */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-3">By Category</p>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors tracking-tight border ${
                          filters.category === category 
                            ? 'bg-blue-700 text-white border-blue-700' 
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100'
                        }`}
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          category: prev.category === category ? '' : category
                        }))}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bookmarks Section */}
            {bookmarkedAffairs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight mb-5 flex items-center">
                  <FaBookmark className="text-blue-700 mr-3" />
                  <span>Your Bookmarks</span>
                </h2>
                <div className="space-y-3">
                  {bookmarkedAffairs.map(affair => (
                    <div
                      key={affair.id}
                      className="p-4 hover:bg-blue-50 rounded-lg cursor-pointer border border-gray-100 transition-colors duration-200 transform hover:-translate-y-1 hover:shadow-sm"
                      onClick={() => {
                        const element = document.getElementById(`affair-${affair.id}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <p className="text-base font-medium text-gray-900 tracking-tight line-clamp-2 font-serif">{affair.title}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-500 tracking-tight flex items-center">
                          <FaCalendarAlt className="mr-1 text-blue-600 text-xs" />
                          {new Date(affair.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
                          {affair.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 hover:shadow-md transition-all duration-300">
              <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight mb-5 flex items-center">
                <FaSearch className="text-blue-700 mr-3" />
                <span>Refine Search</span>
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">By Category</label>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-3 group cursor-pointer">
                        <input
                          type="checkbox"
                          name="category"
                          value={category}
                          checked={filters.category === category}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            category: e.target.checked ? category : ''
                          }))}
                          className="rounded border-gray-300 text-blue-700 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-base text-gray-700 tracking-tight group-hover:text-blue-700 transition-colors">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {(filters.category || filters.search || selectedDate) && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setFilters({ category: '', search: '' });
                        setSelectedDate(null);
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Clear All Filters</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainContent; 