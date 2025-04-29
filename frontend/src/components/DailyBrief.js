import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const DailyBrief = () => {
  // Sample data for testing without backend
  const sampleArticles = [
    {
      id: 1,
      title: "India's Green Hydrogen Mission makes significant progress",
      summary: "The National Green Hydrogen Mission has achieved several milestones in implementation with states announcing policies and major industrial players committing to production facilities.",
      date: "2023-04-29",
      category: "Economy",
      key_concepts: [
        "Green Hydrogen Economy", 
        "Renewable Energy Transition", 
        "Industrial Decarbonization"
      ],
      syllabus_connection: "GS-III: Infrastructure, Energy Sector; Conservation, Environmental Pollution and Degradation",
      potential_questions: [
        "Discuss the significance of Green Hydrogen in India's pursuit of clean energy goals and analyze the challenges in its implementation.",
        "How can the National Green Hydrogen Mission contribute to India's commitment to achieve net-zero emissions?"
      ]
    },
    {
      id: 2,
      title: "Supreme Court ruling on electoral bonds: Transparency in political funding",
      summary: "The Supreme Court has struck down the electoral bond scheme, calling for greater transparency in political funding and directing the disclosure of donor details.",
      date: "2023-04-29",
      category: "Polity",
      key_concepts: [
        "Electoral Transparency", 
        "Campaign Finance", 
        "Constitutional Validity"
      ],
      syllabus_connection: "GS-II: Indian Constitution, Political Funding, Electoral Reforms",
      potential_questions: [
        "Examine the implications of the Supreme Court judgment on electoral bonds for transparency in political funding in India.",
        "Critically analyze the balance between donor privacy and public interest in knowing sources of political funding."
      ]
    },
    {
      id: 3,
      title: "India-Middle East-Europe Economic Corridor (IMEEC) gains momentum",
      summary: "The ambitious IMEEC project involving India, UAE, Saudi Arabia, Jordan, Israel, and European countries is moving forward with feasibility studies and bilateral agreements.",
      date: "2023-04-29",
      category: "International Relations",
      key_concepts: [
        "Economic Corridors", 
        "Strategic Partnerships", 
        "Multimodal Connectivity"
      ],
      syllabus_connection: "GS-II: International Relations; GS-III: Infrastructure, Economic Development",
      potential_questions: [
        "Evaluate the geopolitical and economic significance of the India-Middle East-Europe Economic Corridor (IMEEC).",
        "How does IMEEC fit into India's broader vision of connectivity with West Asia and Europe?"
      ]
    }
  ];

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    categories: [],
    selectedCategories: []
  });

  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, using sample data
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use sample data instead of API call
        setArticles(sampleArticles);
        
        // Extract unique categories
        const categories = [...new Set(sampleArticles.map(article => article.category))];
        setFilters(prev => ({
          ...prev,
          categories
        }));
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load articles");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const toggleCategoryFilter = (category) => {
    setFilters(prev => {
      const currentSelected = [...prev.selectedCategories];
      if (currentSelected.includes(category)) {
        return {
          ...prev,
          selectedCategories: currentSelected.filter(cat => cat !== category)
        };
      } else {
        return {
          ...prev,
          selectedCategories: [...currentSelected, category]
        };
      }
    });
  };

  // Filter articles based on selected categories
  const filteredArticles = articles.filter(article => {
    if (filters.selectedCategories.length === 0) return true;
    return filters.selectedCategories.includes(article.category);
  });

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 my-4">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl font-serif font-bold text-gray-900">The Daily Brief</h1>
              <p className="text-sm text-gray-600">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-xs text-gray-500">UPSC Current Affairs Digest</p>
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="date-picker" className="text-sm text-gray-600">Select Date:</label>
              <input 
                id="date-picker"
                type="date" 
                className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row">
          {/* News Column */}
          <div className="lg:w-3/4 lg:pr-6">
            {filteredArticles.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p>No articles found for the selected date or categories.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full 
                          ${article.category === 'Economy' ? 'bg-green-100 text-green-800' : 
                            article.category === 'Polity' ? 'bg-blue-100 text-blue-800' : 
                            article.category === 'International Relations' ? 'bg-indigo-100 text-indigo-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {article.category}
                        </span>
                        <span className="text-sm text-gray-500">{article.date}</span>
                      </div>
                      
                      <h2 className="text-xl font-serif font-bold mb-2">{article.title}</h2>
                      
                      <div className="prose max-w-none text-gray-700 mb-4">
                        {article.summary}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Key Concepts</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {article.key_concepts.map((concept, index) => (
                            <li key={index} className="text-gray-700">{concept}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Syllabus Connection</h3>
                        <p className="text-gray-700">{article.syllabus_connection}</p>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Potential Questions</h3>
                        <ol className="list-decimal pl-5 space-y-1">
                          {article.potential_questions.map((question, index) => (
                            <li key={index} className="text-gray-700">{question}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 active:text-gray-800 active:bg-gray-50 transition">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Bookmark
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 active:text-gray-800 active:bg-gray-50 transition">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/4 mt-6 lg:mt-0">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="space-y-2">
                  {filters.categories.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        id={`category-${category}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={filters.selectedCategories.includes(category)}
                        onChange={() => toggleCategoryFilter(category)}
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Exam Focus</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md bg-blue-50 text-blue-700 font-medium">
                    Prelims Focus
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 text-gray-700">
                    Mains Focus
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 text-gray-700">
                    Interview Focus
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Links</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                      Today's Hindu Analysis
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                      Monthly Current Affairs PDF
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                      PIB Highlights
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                      Economic Survey Key Points
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyBrief; 