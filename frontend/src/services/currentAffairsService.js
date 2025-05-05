import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const currentAffairsService = {
    // Get all current affairs with optional filters
    getCurrentAffairs: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/current-affairs/`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching current affairs:', error);
            throw error;
        }
    },

    // Get a single current affair by ID
    getCurrentAffair: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/current-affairs/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching current affair:', error);
            throw error;
        }
    },

    // Create a new current affair
    createCurrentAffair: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/current-affairs/`, data);
            return response.data;
        } catch (error) {
            console.error('Error creating current affair:', error);
            throw error;
        }
    },

    // Update an existing current affair
    updateCurrentAffair: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/current-affairs/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating current affair:', error);
            throw error;
        }
    },

    // Delete a current affair
    deleteCurrentAffair: async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/current-affairs/${id}/`);
        } catch (error) {
            console.error('Error deleting current affair:', error);
            throw error;
        }
    },

    // Summarize news articles
    summarizeNews: async (articles) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/summarize-news/`, {
                articles
            });
            return response.data;
        } catch (error) {
            console.error('Error summarizing news:', error);
            throw error;
        }
    }
}; 