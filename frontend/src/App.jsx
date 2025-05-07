import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';
import MainContent from './components/MainContent';
import Login from './components/Login';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is already logged in
        if (authService.isAuthenticated()) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <div className="App">
            {isAuthenticated ? (
                <MainContent />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App; 