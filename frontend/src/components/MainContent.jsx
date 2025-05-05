import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import NewsCard from './NewsCard';

function MainContent() {
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentAffairs = async () => {
      try {
        if (!authService.isAuthenticated()) {
          throw new Error('Not authenticated');
        }

        const headers = authService.getAuthHeaders();
        console.log('Request headers:', headers);
        console.log('Request URL:', 'http://localhost:8000/api/current-affairs/');

        const response = await fetch('http://localhost:8000/api/current-affairs/', {
          headers: headers,
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
          }
          if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            console.log('Response text:', text);
            throw new Error('Server returned HTML instead of JSON. Please check your authentication.');
          }
          throw new Error('Failed to fetch current affairs');
        }

        const data = await response.json();
        console.log('Response data:', data);
        setCurrentAffairs(data);
      } catch (err) {
        console.error('Error fetching current affairs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentAffairs();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <div className="space-y-6">
              {currentAffairs.map((affair) => (
                <NewsCard key={affair.id} currentAffair={affair} />
              ))}
            </div>
          )}
        </div>
        <div className="w-64 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          {/* Filters will be added here */}
        </div>
      </div>
    </main>
  );
}

export default MainContent; 