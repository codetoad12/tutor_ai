import { apiService } from './services/api.js';

class CurrentAffairs {
    constructor() {
        this.articles = [];
        this.initialize();
    }

    async initialize() {
        await this.fetchCurrentAffairs();
        this.setupEventListeners();
    }

    async fetchCurrentAffairs() {
        try {
            const response = await apiService.get('/api/current-affairs/');
            this.articles = response.data;
            this.renderArticles();
        } catch (error) {
            console.error('Error fetching current affairs:', error);
            this.showError('Failed to load current affairs');
        }
    }

    renderArticles() {
        const container = document.querySelector('.current-affairs-container');
        if (!container) return;

        container.innerHTML = `
            <h1>Current Affairs</h1>
            <div class="search-container">
                <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Search articles..."
                />
            </div>
            <div class="articles-list">
                ${this.articles.map(article => this.renderArticle(article)).join('')}
            </div>
        `;
    }

    renderArticle(article) {
        return `
            <div class="news-article" id="article-${article.id}">
                <h2>${article.title}</h2>
                <div class="article-meta">
                    <span class="date">${article.date}</span>
                    <span class="category">${article.category}</span>
                </div>
                
                <div class="summary">
                    ${article.summary}
                </div>
                
                <div class="key-concepts">
                    <h3>Key Concepts</h3>
                    <ul>
                        ${article.key_concepts.map(concept => `<li>${concept}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="syllabus-connection">
                    <h3>Syllabus Connection</h3>
                    <p>${article.syllabus_connection}</p>
                </div>
                
                <div class="potential-questions">
                    <h3>Potential Questions</h3>
                    <ol>
                        ${article.potential_questions.map(question => `<li>${question}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="article-actions">
                    <button 
                        class="bookmark-btn"
                        data-article-id="${article.id}"
                        onclick="currentAffairs.toggleBookmark(${article.id})"
                    >
                        Bookmark
                    </button>
                    <button 
                        class="share-btn"
                        onclick="currentAffairs.shareArticle(${article.id})"
                    >
                        Share
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const articles = document.querySelectorAll('.news-article');
        
        articles.forEach(article => {
            const text = article.textContent.toLowerCase();
            article.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    toggleBookmark(articleId) {
        const button = document.querySelector(`[data-article-id="${articleId}"]`);
        if (button) {
            button.classList.toggle('bookmarked');
            // Add logic to save/remove bookmark
        }
    }

    shareArticle(articleId) {
        const article = document.getElementById(`article-${articleId}`);
        if (article) {
            const title = article.querySelector('h2').textContent;
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: title,
                    url: url
                }).catch(console.error);
            }
        }
    }

    showError(message) {
        const container = document.querySelector('.current-affairs-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    ${message}
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.currentAffairs = new CurrentAffairs();
}); 