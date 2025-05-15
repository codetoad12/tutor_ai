import React, { useState, useEffect } from 'react';
import { currentAffairsService } from '../../services/currentAffairsService';

const CurrentAffairsList = () => {
    console.log('RENDERING UPDATED CURRENTAFFAIRSLIST COMPONENT - v2');
    
    const [currentAffairs, setCurrentAffairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        category: ''
    });

    useEffect(() => {
        fetchCurrentAffairs();
    }, [filters]);

    const fetchCurrentAffairs = async () => {
        try {
            setLoading(true);
            const data = await currentAffairsService.getCurrentAffairs(filters);
            console.log('Current Affairs data:', data); // Debug log to see data structure
            setCurrentAffairs(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch current affairs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Render stars based on importance (1-5)
    const renderImportanceStars = (importance) => {
        // Make sure importance is a number
        const numImportance = Number(importance) || 0;
        // Ensure it's within the 1-5 range
        const starCount = Math.min(Math.max(numImportance, 0), 5);
        
        return (
            <div className="flex items-center mb-2">
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

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Current Affairs</h1>
            
            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        placeholder="Enter category"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Current Affairs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentAffairs.map((affair) => (
                    <div key={affair.id} className="bg-white rounded-lg shadow-md p-6">
                        {/* Article title as clickable link with external icon */}
                        <h2 className="text-xl font-semibold mb-2">
                            {affair.article_link ? (
                                <a 
                                    href={affair.article_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-600 flex items-center"
                                >
                                    {affair.title}
                                    <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            ) : (
                                affair.title
                            )}
                        </h2>
                        
                        {/* Importance stars right below the headline */}
                        {affair.importance !== null && affair.importance !== undefined && (
                            renderImportanceStars(affair.importance)
                        )}
                        
                        <p className="text-gray-600 mb-2">{new Date(affair.date).toLocaleDateString()}</p>
                        <p className="text-sm text-indigo-600 mb-2">{affair.category}</p>
                        
                        {/* Debug information */}
                        <div className="mb-2 text-xs bg-gray-100 p-2 rounded">
                            <div>Importance field: {JSON.stringify(affair.importance)}</div>
                            <div>Article link field: {JSON.stringify(affair.article_link)}</div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{affair.summary}</p>
                        
                        {/* AI Insights */}
                        {(affair.ai_insights || affair.ai_insight || affair.syllabus_connection) && (
                            <div className="mb-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-700 p-4 rounded-lg">
                                <h3 className="font-medium mb-1 text-blue-700">UPSC Expert Insight:</h3>
                                
                                {affair.syllabus_connection && (
                                    <p className="mb-2 font-medium text-xs">Syllabus: {affair.syllabus_connection}</p>
                                )}
                                
                                <p className="text-sm text-gray-700 italic">
                                    {(affair.ai_insight || affair.ai_insights) && 
                                        (affair.ai_insight || affair.ai_insights)}
                                </p>
                                
                                {Array.isArray(affair.tags) && affair.tags.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-600">Key Topics:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {affair.tags.map((tag, idx) => (
                                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {affair.key_concepts && !(affair.ai_insights || affair.ai_insight) && (
                            <div className="mb-4">
                                <h3 className="font-medium mb-1">Key Concepts:</h3>
                                <p className="text-sm text-gray-600">{affair.key_concepts}</p>
                            </div>
                        )}
                        
                        {affair.usage_hint && (
                            <div>
                                <h3 className="font-medium mb-1">Usage Hint:</h3>
                                <p className="text-sm text-gray-600">{affair.usage_hint}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CurrentAffairsList; 