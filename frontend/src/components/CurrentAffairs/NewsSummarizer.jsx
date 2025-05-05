import React, { useState } from 'react';
import { currentAffairsService } from '../../services/currentAffairsService';

const NewsSummarizer = () => {
    const [articles, setArticles] = useState([{ title: '', content: '' }]);
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
        setArticles([...articles, { title: '', content: '' }]);
    };

    const removeArticle = (index) => {
        const newArticles = articles.filter((_, i) => i !== index);
        setArticles(newArticles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSummary(null);

        try {
            const result = await currentAffairsService.summarizeNews(articles);
            setSummary(result);
        } catch (err) {
            setError('Failed to summarize news articles');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                        {Object.entries(summary).map(([key, value]) => (
                            <div key={key} className="mb-4">
                                <h3 className="text-lg font-medium capitalize mb-2">
                                    {key.replace('_', ' ')}
                                </h3>
                                <p className="text-gray-700">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsSummarizer; 