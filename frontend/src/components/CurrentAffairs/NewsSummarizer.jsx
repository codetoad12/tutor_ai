import React, { useState } from 'react';
import { currentAffairsService } from '../../services/currentAffairsService';

const NewsSummarizer = () => {
    const [articles, setArticles] = useState([{ title: '', content: '', article_link: '', importance: 3 }]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleArticleChange = (index, field, value) => {
        const newArticles = [...articles];
        newArticles[index] = {
            ...newArticles[index],
            [field]: value
        };
        setArticles(newArticles);
    };

    const addArticle = () => {
        setArticles([...articles, { title: '', content: '', article_link: '', importance: 3 }]);
    };

    const removeArticle = (index) => {
        const newArticles = articles.filter((_, i) => i !== index);
        setArticles(newArticles);
    };

    // Render stars for importance selection
    const renderImportanceSelector = (index, currentValue) => {
        return (
            <div className="flex items-center">
                <span className="text-sm mr-2">Select importance (1-5):</span>
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                            key={rating}
                            type="button"
                            onClick={() => handleArticleChange(index, 'importance', rating)}
                            className={`h-8 w-8 mx-1 rounded-full flex items-center justify-center focus:outline-none 
                                ${rating <= currentValue ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {rating}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSummary(null);

        try {
            const result = await currentAffairsService.summarizeNews(articles);
            console.log('API response:', result); // Debug log
            setSummary(result);
        } catch (err) {
            setError('Failed to summarize news articles');
            console.error(err);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">News Summarizer</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {articles.map((article, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Article {index + 1}</h2>
                            {articles.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArticle(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={article.title}
                                    onChange={(e) => handleArticleChange(index, 'title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                <textarea
                                    value={article.content}
                                    onChange={(e) => handleArticleChange(index, 'content', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Article Link</label>
                                <input
                                    type="url"
                                    value={article.article_link}
                                    onChange={(e) => handleArticleChange(index, 'article_link', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="https://example.com/article"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Importance</label>
                                {renderImportanceSelector(index, article.importance)}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={addArticle}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Add Another Article
                    </button>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Summarizing...' : 'Summarize'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {summary && (
                <div className="mt-6 space-y-4">
                    <h2 className="text-2xl font-semibold">Summary</h2>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {/* Check for the presence of article_analyses directly or in a nested structure */}
                        {summary.article_analyses ? (
                            // Direct access to article_analyses
                            summary.article_analyses.map((article, index) => (
                                <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                                    <h3 className="text-lg font-medium mb-2">
                                        {article.article_link ? (
                                            <a 
                                                href={article.article_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-blue-600 flex items-center"
                                            >
                                                {article.headline}
                                                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ) : (
                                            article.headline
                                        )}
                                    </h3>
                                    
                                    {/* Display importance value and stars */}
                                    <div className="mb-3">
                                        <div className="text-xs text-gray-500 mb-1">
                                            Raw importance value: {JSON.stringify(article.importance)}
                                        </div>
                                        {renderImportanceStars(article.importance)}
                                    </div>
                                    
                                    <p className="text-gray-700 mb-3">{article.summary}</p>
                                    
                                    {/* AI Insights */}
                                    {(article.ai_insights || article.key_concepts || article.syllabus_connection) && (
                                        <div className="mb-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-700 p-4 rounded-lg">
                                            <h3 className="font-medium mb-1 text-blue-700">UPSC Expert Insight:</h3>
                                            
                                            {article.syllabus_connection && (
                                                <p className="mb-2 font-medium text-xs">
                                                    Syllabus: {article.syllabus_connection}
                                                </p>
                                            )}
                                            
                                            {article.ai_insights && (
                                                <p className="text-sm text-gray-700 italic">
                                                    {article.ai_insights}
                                                </p>
                                            )}
                                            
                                            {!article.ai_insights && article.key_concepts && (
                                                <p className="text-sm text-gray-700 italic">
                                                    {article.key_concepts}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Only show key concepts separately if not already shown as insights */}
                                    {article.key_concepts && !article.ai_insights && (article.syllabus_connection || article.ai_insights) && (
                                        <div className="mb-2">
                                            <span className="font-medium">Key Concepts:</span> {article.key_concepts}
                                        </div>
                                    )}
                                    
                                    {article.potential_questions && article.potential_questions.length > 0 && (
                                        <div>
                                            <span className="font-medium block mb-1">Potential Questions:</span>
                                            <ul className="list-disc pl-5">
                                                {article.potential_questions.map((q, i) => (
                                                    <li key={i} className="text-sm text-gray-700">{q}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div>
                                <p className="text-gray-700">No article analyses found in the API response. Please check the console for debugging information.</p>
                                <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                                    {JSON.stringify(summary, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsSummarizer; 