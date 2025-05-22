import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import NewsCard from './NewsCard';
import { FaBookmark, FaRegBookmark, FaChartLine, FaQuestionCircle, FaSearch, FaCalendarAlt, FaClock, FaGraduationCap, FaLightbulb, FaExternalLinkAlt, FaClipboardList } from 'react-icons/fa';

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
  const [categoryCounts, setCategoryCounts] = useState({});
  const [daysToExam, setDaysToExam] = useState(null);

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

  // Quick resources links
  const quickResources = [
    { name: 'UPSC Official Website', url: 'https://upsc.gov.in/' },
    { name: 'Monthly Current Affairs PDF', url: '#' },
    { name: 'PIB Daily Bulletin', url: 'https://pib.gov.in/Allrel.aspx' },
    { name: 'UPSC Syllabus PDF', url: '#' },
    { name: 'Previous Year Question Papers', url: '#' }
  ];

  // Study tips
  const studyTips = [
    "Review daily news analysis before bedtime",
    "Connect current affairs to static syllabus topics",
    "Practice answer writing for at least 30 minutes daily",
    "Make mind maps for complex topics",
    "Revise your notes weekly"
  ];

  useEffect(() => {
    // Calculate days to prelims exam (assuming May 26, 2024 for example)
    const examDate = new Date('2024-05-26');
    const today = new Date();
    const diffTime = Math.abs(examDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysToExam(diffDays);

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
        
        // Calculate category counts
        const counts = {};
        data.forEach(affair => {
          if (affair.category) {
            counts[affair.category] = (counts[affair.category] || 0) + 1;
          }
        });
        setCategoryCounts(counts);
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Left side */}
          <div className="w-full lg:w-1/4">
            {/* Exam Countdown */}
            {daysToExam && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 mb-6 shadow-sm text-white relative overflow-hidden">
                <div className="absolute -right-5 -top-5 bg-blue-500 rounded-full w-20 h-20 opacity-20"></div>
                <div className="absolute -left-5 -bottom-5 bg-blue-500 rounded-full w-16 h-16 opacity-20"></div>
                
                <div className="flex items-center mb-3">
                  <FaClock className="mr-2 text-xl" />
                  <h3 className="text-lg font-medium font-serif">UPSC Prelims Countdown</h3>
                </div>
                
                <div className="text-3xl font-bold tracking-tight mb-1">{daysToExam} days</div>
                <p className="text-sm text-blue-100">to go for UPSC CSE Prelims 2024</p>
                
                <div className="mt-4 pt-4 border-t border-blue-500">
                  <div className="text-sm">
                    <span className="font-medium">Exam Date:</span> May 26, 2024
                  </div>
                </div>
              </div>
            )}
          
            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4 font-serif">Categories</h3>
              <ul className="space-y-3">
                {categories.map(category => (
                  <li key={category} className="group">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, category }))}
                      className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{category}</span>
                      <span className={`bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-xs ${
                        filters.category === category ? 'bg-blue-100' : ''
                      }`}>
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trending Topics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4 font-serif">Trending Topics</h3>
              <ul className="space-y-3">
                {trendingTopics.map(topic => (
                  <li key={topic.name} className="group">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, search: topic.name }))}
                      className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{topic.name}</span>
                      <span className="bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-xs">
                        {topic.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Quick Resources */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center mb-4">
                <FaGraduationCap className="mr-2 text-blue-700" />
                <h3 className="text-lg font-medium text-gray-800 font-serif">Quick Resources</h3>
              </div>
              
              <ul className="space-y-2">
                {quickResources.map((resource, index) => (
                  <li key={index}>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {resource.name}
                      <FaExternalLinkAlt className="ml-2 text-xs text-gray-400" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Study Tips */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-100 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <FaLightbulb className="mr-2 text-amber-500" />
                <h3 className="text-lg font-medium text-gray-800 font-serif">Study Tips</h3>
              </div>
              
              <ul className="space-y-3">
                {studyTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <FaClipboardList className="text-amber-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main News Column - Centered */}
          <div className="w-full lg:w-3/4 max-w-3xl mx-auto">
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
                    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-wrap justify-between items-center shadow-sm mb-8">
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
                      <div key={affair.id} className="mb-8">
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
        </div>
      </main>
    </div>
  );
}

export default MainContent; 