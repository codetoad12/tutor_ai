import { authService } from './auth.js';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Get headers with authentication
    getHeaders() {
        return authService.getAuthHeaders();
    }

    // Session Management
    async createSession(title) {
        const response = await fetch(`${this.baseUrl}/chat/sessions/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ title })
        });
        return this.handleResponse(response);
    }

    async getSessions() {
        const response = await fetch(`${this.baseUrl}/chat/sessions/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getSession(sessionId) {
        const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Message Management
    async getMessages(sessionId) {
        const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}/messages/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async sendMessage(sessionId, content) {
        const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}/messages/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ content })
        });
        return this.handleResponse(response);
    }

    async provideFeedback(messageId, feedback, feedbackText = '') {
        const response = await fetch(`${this.baseUrl}/chat/messages/${messageId}/feedback/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ feedback, feedback_text: feedbackText })
        });
        return this.handleResponse(response);
    }

    // Helper method to handle responses
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            
            // Handle authentication errors
            if (response.status === 401) {
                authService.logout();
                window.location.href = '/login.html';
                throw new Error('Authentication required. Please log in.');
            }
            
            throw new Error(error.message || 'An error occurred');
        }
        return response.json();
    }
}

export const apiService = new ApiService(); 