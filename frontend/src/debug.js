// Debug utility for chat UI
export function debugChatUI() {
    console.log('=== CHAT UI DEBUG ===');
    
    // Check DOM elements
    const elements = {
        chatMessages: document.querySelector('.chat-messages'),
        messageInput: document.querySelector('.message-input'),
        sendButton: document.querySelector('.send-button'),
        tutorAvatar: document.querySelector('.tutor-avatar'),
        logoutButton: document.querySelector('.logout-button'),
        userNameDisplay: document.querySelector('.user-name')
    };
    
    console.log('DOM Elements:');
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`${name}: ${element ? 'Found' : 'Missing'}`);
    });
    
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    console.log('Authentication:');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('User:', user);
    
    // Check API connection
    fetch('http://localhost:8000/api/health/')
        .then(response => {
            console.log('API Health Check:', response.ok ? 'OK' : 'Failed');
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
        })
        .catch(error => {
            console.error('API Connection Error:', error);
        });
    
    console.log('=== END DEBUG ===');
} 