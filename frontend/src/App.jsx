import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService } from './services/auth';
import MainContent from './components/MainContent';
import Login from './components/Login';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import DailyBrief from './components/DailyBrief';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/Chat/ChatInterface';

// Wrapper component to conditionally render Header based on the route
const AppContent = ({ isAuthenticated, handleLogout, selectedDate, handleDateChange }) => {
    const location = useLocation();
    // Hide header on chat page and landing page (root path)
    const showHeader = location.pathname !== '/chat' && location.pathname !== '/';
    
    if (!isAuthenticated) {
        return <Login onLogin={() => window.location.reload()} />;
    }
    
    return (
        <>
            {showHeader && (
                <Header 
                    onLogout={handleLogout}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                />
            )}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/current-affairs" element={<MainContent />} />
                <Route path="/news" element={<NewsCard />} />
                <Route path="/daily-brief" element={<DailyBrief />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        // Check if user is already logged in
        const checkAuthStatus = () => {
            const isAuth = authService.isAuthenticated();
            setIsAuthenticated(isAuth);
            setIsLoading(false);
        };
        
        checkAuthStatus();
        
        // Listen for storage events to handle authentication changes in other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === 'user') {
                checkAuthStatus();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    const handleDateChange = (event) => {
        const date = event.target.value ? new Date(event.target.value) : null;
        setSelectedDate(date);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
        </div>;
    }

    return (
        <Router>
            <div className="App">
                <AppContent 
                    isAuthenticated={isAuthenticated}
                    handleLogout={handleLogout}
                    selectedDate={selectedDate}
                    handleDateChange={handleDateChange}
                />
            </div>
        </Router>
    );
}

export default App; 