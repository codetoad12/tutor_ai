// Auth service to handle user authentication
const API_URL = 'http://localhost:8000/api';

class AuthService {
    constructor() {
        try {
            // Check if remember me is enabled
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            
            if (rememberMe) {
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
            } else {
                // If remember me is not enabled, use sessionStorage
                this.token = sessionStorage.getItem('token');
                const userStr = sessionStorage.getItem('user');
                this.user = userStr ? JSON.parse(userStr) : null;
            }
        } catch (e) {
            console.error('Error initializing AuthService:', e);
            this.token = null;
            this.user = null;
        }
    }

    async login(username, password, rememberMe = false) {
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
                if (response.status === 401) {
                    throw new Error('Invalid username or password');
                } else if (response.status === 400) {
                    throw new Error(error.detail || 'Please check your credentials');
                } else {
                    throw new Error('Login failed. Please try again later');
                }
            }

            const data = await response.json();
            this.token = data.access;
            this.user = data.user;

            // Store in appropriate storage based on remember me
            if (rememberMe) {
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                localStorage.setItem('rememberMe', 'true');
            } else {
                sessionStorage.setItem('token', this.token);
                sessionStorage.setItem('user', JSON.stringify(this.user));
                localStorage.removeItem('rememberMe');
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
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
                if (response.status === 400) {
                    const errorMessage = Object.entries(error)
                        .map(([key, value]) => `${key}: ${value.join(', ')}`)
                        .join('\n');
                    throw new Error(errorMessage || 'Please check your registration details');
                } else {
                    throw new Error('Registration failed. Please try again later');
                }
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        // Clear both storage types
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
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
        if (!token) {
            console.warn('No authentication token available');
        }
        
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }
}

export const authService = new AuthService(); 