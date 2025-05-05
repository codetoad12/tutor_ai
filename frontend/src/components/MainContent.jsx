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
    dateRange: 'all',
    search: ''
  });
  const [bookmarkedAffairs, setBookmarkedAffairs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
          throw new Error('Not authenticated');
        }

        const headers = authService.getAuthHeaders();
        const response = await fetch('http://localhost:8000/api/current-affairs/', {
          headers: headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
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

    // Apply date range filter
    const today = new Date();
    if (filters.dateRange === 'today') {
      filtered = filtered.filter(affair => {
        const affairDate = new Date(affair.date);
        return affairDate.toDateString() === today.toDateString();
      });
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter(affair => {
        const affairDate = new Date(affair.date);
        return affairDate >= weekAgo;
      });
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      filtered = filtered.filter(affair => {
        const affairDate = new Date(affair.date);
        return affairDate >= monthAgo;
      });
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
  }, [currentAffairs, filters]);

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-serif font-bold text-center text-blue-700 tracking-tight mb-3">The Daily Brief</h1>
          <p className="text-xl text-gray-600 text-center tracking-tight mb-8">Curated Current Affairs for UPSC Aspirants</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by topic or keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base tracking-tight"
                value={filters.search}
                onChange={handleSearch}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base tracking-tight"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
              />
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main News Column */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-8 text-gray-600 text-base tracking-tight">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-8 text-base tracking-tight">{error}</div>
            ) : (
              <div className="space-y-8">
                {filteredAffairs.map((affair) => (
                  <NewsCard 
                    key={affair.id} 
                    currentAffair={affair}
                    isBookmarked={bookmarkedAffairs.some(a => a.id === affair.id)}
                    onBookmark={() => handleBookmark(affair)}
                  />
                ))}
                {filteredAffairs.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-base tracking-tight">
                    No current affairs found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Weekly Quiz Button */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 min-h-[150px] flex items-center justify-center hover:shadow-lg transition-all duration-300">
              <button className="w-full bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-base tracking-tight">
                <FaQuestionCircle className="text-lg" />
                <span>Weekly Quiz</span>
              </button>
            </div>

            {/* Trending Topics */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 min-h-[150px] hover:shadow-lg transition-all duration-300">
              <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight mb-4 flex items-center gap-2">
                <FaChartLine className="text-blue-700" />
                Trending Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 cursor-pointer transition-colors tracking-tight"
                    style={{ fontSize: `${0.4 + (topic.count / 50)}rem` }}
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Bookmarks Section */}
            {bookmarkedAffairs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 min-h-[150px] hover:shadow-lg transition-all duration-300">
                <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight mb-4 flex items-center gap-2">
                  <FaBookmark className="text-blue-700" />
                  Bookmarks
                </h2>
                <div className="space-y-3">
                  {bookmarkedAffairs.map(affair => (
                    <div
                      key={affair.id}
                      className="p-3 hover:bg-blue-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                      onClick={() => {
                        const element = document.getElementById(`affair-${affair.id}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <p className="text-base font-medium text-gray-900 truncate tracking-tight">{affair.title}</p>
                      <p className="text-sm text-gray-500 mt-1 tracking-tight">{new Date(affair.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 min-h-[150px] hover:shadow-lg transition-all duration-300">
              <h2 className="text-xl font-serif font-semibold text-blue-700 tracking-tight mb-4">Categories</h2>
              <div className="space-y-3">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-3">
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
                    <span className="text-base text-gray-700 tracking-tight">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainContent; 