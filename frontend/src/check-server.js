import API_BASE_URL from './config.js';

// Script to check if the Django server is running
async function checkDjangoServer() {
    console.log('Checking Django server...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/health/`);
        console.log('Django server response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Django server is running:', data);
            return true;
        } else {
            console.error('Django server returned error status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Failed to connect to Django server:', error);
        return false;
    }
}

// Run the check
checkDjangoServer(); 