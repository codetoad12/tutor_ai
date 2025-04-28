import React, { useState, useEffect } from 'react';
import '../styles/current_affairs.css';

const CurrentAffairs = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCurrentAffairs();
    }, []);

    const fetchCurrentAffairs = async () => {
        try {
            const response = await fetch('/api/current-affairs/');
            if (!response.ok) {
                throw new Error('Failed to fetch current affairs');
            }
            const data = await response.json();
            setArticles(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading current affairs...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="current-affairs-container">
            <h1>Current Affairs</h1>
            <div className="search-container">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search articles..."
                />
            </div>
            
            {articles.map((article) => (
                <div key={article.id} className="news-article">
                    <h2>{article.title}</h2>
                    <div className="article-meta">
                        <span className="date">{article.date}</span>
                        <span className="category">{article.category}</span>
                    </div>
                    
                    <div className="summary">
                        {article.summary}
                    </div>
                    
                    <div className="key-concepts">
                        <h3>Key Concepts</h3>
                        <ul>
                            {article.key_concepts.map((concept, index) => (
                                <li key={index}>{concept}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="syllabus-connection">
                        <h3>Syllabus Connection</h3>
                        <p>{article.syllabus_connection}</p>
                    </div>
                    
                    <div className="potential-questions">
                        <h3>Potential Questions</h3>
                        <ol>
                            {article.potential_questions.map((question, index) => (
                                <li key={index}>{question}</li>
                            ))}
                        </ol>
                    </div>
                    
                    <div className="article-actions">
                        <button 
                            className="bookmark-btn"
                            onClick={() => toggleBookmark(article.id)}
                            data-article-id={article.id}
                        >
                            Bookmark
                        </button>
                        <button 
                            className="share-btn"
                            onClick={() => shareArticle(article.id)}
                        >
                            Share
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CurrentAffairs; 