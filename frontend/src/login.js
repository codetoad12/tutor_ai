import { authService } from './services/auth.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// Check if user is already logged in
if (authService.isAuthenticated()) {
    window.location.href = 'index.html';
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;
        
        // Hide any previous error
        errorMessage.classList.add('hidden');
        
        // Attempt login
        await authService.login(username, password);
        
        // Redirect to chat page
        window.location.href = 'index.html';
    } catch (error) {
        // Show error message
        errorMessage.textContent = error.message || 'Login failed. Please try again.';
        errorMessage.classList.remove('hidden');
        
        // Reset button
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Login';
        submitButton.disabled = false;
    }
}); 