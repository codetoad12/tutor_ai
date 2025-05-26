import { authService } from './auth.js';

const API_BASE_URL = 'http://localhost:8000/api';

class GoalService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Get headers with authentication
    getHeaders() {
        return authService.getAuthHeaders();
    }

    // Goal Management
    async getGoals() {
        console.log('GoalService: Fetching goals from API...'); // Debug log
        const response = await fetch(`${this.baseUrl}/progress-tracker/goals/`, {
            headers: this.getHeaders()
        });
        const result = await this.handleResponse(response);
        console.log('GoalService: Goals response:', result); // Debug log
        
        // Handle paginated response from Django REST Framework
        if (result && typeof result === 'object' && Array.isArray(result.results)) {
            return result.results;
        }
        
        // Fallback: if it's already an array, return it
        return Array.isArray(result) ? result : [];
    }

    async createGoal(goalData) {
        console.log('GoalService: Creating goal with data:', goalData); // Debug log
        const response = await fetch(`${this.baseUrl}/progress-tracker/goals/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(goalData)
        });
        const result = await this.handleResponse(response);
        console.log('GoalService: Goal created successfully:', result); // Debug log
        return result;
    }

    async updateGoal(goalId, goalData) {
        const response = await fetch(`${this.baseUrl}/progress-tracker/goals/${goalId}/`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(goalData)
        });
        return this.handleResponse(response);
    }

    async deleteGoal(goalId) {
        const response = await fetch(`${this.baseUrl}/progress-tracker/goals/${goalId}/`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async toggleGoalCompletion(goalId) {
        const response = await fetch(`${this.baseUrl}/progress-tracker/goals/${goalId}/toggle-completion/`, {
            method: 'POST',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Goal Attachments Management
    async getGoalAttachments() {
        const response = await fetch(`${this.baseUrl}/progress-tracker/attachments/`, {
            headers: this.getHeaders()
        });
        const result = await this.handleResponse(response);
        
        // Handle paginated response from Django REST Framework
        if (result && typeof result === 'object' && Array.isArray(result.results)) {
            return result.results;
        }
        
        // Fallback: if it's already an array, return it
        return Array.isArray(result) ? result : [];
    }

    async createGoalAttachment(attachmentData) {
        const response = await fetch(`${this.baseUrl}/progress-tracker/attachments/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(attachmentData)
        });
        return this.handleResponse(response);
    }

    async deleteGoalAttachment(attachmentId) {
        const response = await fetch(`${this.baseUrl}/progress-tracker/attachments/${attachmentId}/`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Helper method to handle responses
    async handleResponse(response) {
        console.log('GoalService: Response status:', response.status, response.statusText); // Debug log
        
        if (!response.ok) {
            let errorMessage = 'An error occurred';
            
            try {
                const error = await response.json();
                console.log('GoalService: Error response:', error); // Debug log
                errorMessage = error.message || error.detail || JSON.stringify(error);
            } catch (parseError) {
                console.log('GoalService: Could not parse error response, using status text'); // Debug log
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            
            // Handle authentication errors
            if (response.status === 401) {
                authService.logout();
                window.location.href = '/login.html';
                throw new Error('Authentication required. Please log in.');
            }
            
            throw new Error(errorMessage);
        }
        
        // Handle empty responses (like for DELETE requests)
        if (response.status === 204) {
            return {};
        }
        
        return response.json();
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    isGoalOverdue(deadline) {
        const today = new Date();
        const goalDeadline = new Date(deadline);
        return goalDeadline < today;
    }

    getDaysUntilDeadline(deadline) {
        const today = new Date();
        const goalDeadline = new Date(deadline);
        const timeDiff = goalDeadline - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return daysDiff;
    }
}

export const goalService = new GoalService(); 