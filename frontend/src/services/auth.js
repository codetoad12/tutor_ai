// Auth service to handle user authentication
const API_URL = 'http://localhost:8000/api';

class AuthService {
    constructor() {
        try {
            // Safely get token from localStorage
            this.token = localStorage.getItem('token');
            if (this.token === null || this.token === undefined) {
                this.token = null;
            }
            
            // Safely get user from localStorage
            const userStr = localStorage.getItem('user');
            if (userStr === null || userStr === undefined || userStr === '') {
                this.user = null;
            } else {
                try {
                    this.user = JSON.parse(userStr);
                } catch (e) {
                    console.error('Error parsing user data from localStorage:', e);
                    this.user = null;
                    // Clean up invalid data
                    localStorage.removeItem('user');
                }
            }
        } catch (e) {
            console.error('Error initializing AuthService:', e);
            this.token = null;
            this.user = null;
        }
    }

    async login(username, password) {
        try {
            // Determine if the input is an email or username
            const isEmail = username.includes('@');
            const loginData = isEmail ? { email: username, password } : { username, password };

            const response = await fetch(`${API_URL}/auth/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();
            this.token = data.access;
            this.user = data.user;

            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            return data;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            // Validate that either username or email is provided
            if (!userData.username && !userData.email) {
                throw new Error('Either username or email is required');
            }

            const response = await fetch(`${API_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }

    isAuthenticated() {
        return this.token !== null;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    // Get authentication headers for API requests
    getAuthHeaders() {
        const token = this.getToken();
        console.log('Getting auth headers, token:', token ? 'Present' : 'Missing');
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
        
        console.log('Auth headers:', headers);
        return headers;
    }
}

export const authService = new AuthService(); 