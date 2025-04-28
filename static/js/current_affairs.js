// Current Affairs App JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any interactive elements
    initializeAccordions();
    initializeSearch();
});

function initializeAccordions() {
    // Add accordion functionality to sections if needed
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
        accordion.addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
}

function initializeSearch() {
    // Add search functionality if needed
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const articles = document.querySelectorAll('.news-article');
            
            articles.forEach(article => {
                const text = article.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    article.style.display = '';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    }
}

// Function to handle article sharing
function shareArticle(articleId) {
    // Implement sharing functionality
    const article = document.getElementById(articleId);
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

// Function to handle article bookmarking
function toggleBookmark(articleId) {
    const button = document.querySelector(`[data-article-id="${articleId}"]`);
    if (button) {
        button.classList.toggle('bookmarked');
        // Add logic to save/remove bookmark
    }
} 