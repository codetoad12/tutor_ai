import { apiService } from './services/api.js';
import { authService } from './services/auth.js';
import { debugChatUI } from './debug.js';
import lottie from 'lottie-web';

// Constants for localStorage
const SESSION_ID_KEY = 'tutor_ai_current_session';

// Check if Django server is running
async function checkDjangoServer() {
    console.log('Checking Django server...');
    
    try {
        const response = await fetch('http://localhost:8000/api/health/');
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

// Run debug utility
debugChatUI();

// Check if Django server is running
checkDjangoServer().then(isRunning => {
    if (!isRunning) {
        showError('Django server is not running. Please start the server and refresh the page.');
    }
});

// Check if user is authenticated
if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
}

// DOM Elements
const chatMessages = document.querySelector('.chat-messages');
const messageInput = document.querySelector('.message-input');
const sendButton = document.querySelector('.send-button');
const tutorAvatar = document.querySelector('.tutor-avatar');
const logoutButton = document.querySelector('.logout-button');
const userNameDisplay = document.querySelector('.user-name');

// State management
let currentSessionId = null;
let isProcessing = false;

// Set user name in header
const user = authService.getUser();
if (user && userNameDisplay) {
    userNameDisplay.textContent = user.username || 'Student';
}

// Initialize the chat interface
async function initializeChat() {
    try {
        // Try to get existing session ID from localStorage
        const savedSessionId = localStorage.getItem(SESSION_ID_KEY);
        
        // Get current active sessions from the backend
        const sessions = await apiService.getSessions();
        console.log('Available sessions:', sessions);
        
        if (savedSessionId && sessions.some(session => session.id === savedSessionId)) {
            // If we have a saved ID and it exists in the backend
            currentSessionId = savedSessionId;
            console.log('Using saved session ID:', currentSessionId);
        } else if (sessions.length > 0) {
            // Use the most recent session from the backend
            currentSessionId = sessions[0].id;
            console.log('Using most recent session from backend:', currentSessionId);
        } else {
            // Create a new session if none exists
            console.log('Creating new session...');
            const newSession = await apiService.createSession('New Chat Session');
            currentSessionId = newSession.id;
            console.log('Created new session:', currentSessionId);
        }
        
        // Save the current session ID to localStorage
        localStorage.setItem(SESSION_ID_KEY, currentSessionId);
        
        // Load messages for this session
        await loadMessagesForSession(currentSessionId);
    } catch (error) {
        console.error('Failed to initialize chat:', error);
        showError('Failed to connect to the chat service');
    }
}

// Load messages for a specific session
async function loadMessagesForSession(sessionId) {
    try {
        // Clear existing messages
        chatMessages.innerHTML = '';
        
        // Get messages from API
        const messages = await apiService.getMessages(sessionId);
        console.log('Loaded messages from API:', messages.length);
        
        if (messages.length === 0) {
            // Add welcome message if no messages exist
            const welcomeElement = document.createElement('div');
            welcomeElement.classList.add('welcome-message');
            welcomeElement.innerHTML = `
                <h3>Welcome to AI Tutor!</h3>
                <p>Ask any question about UPSC exam preparation.</p>
            `;
            chatMessages.appendChild(welcomeElement);
        } else {
            // Display messages in the order they were received from the API
            messages.forEach(message => {
                // Add user message
                appendMessage(message.content, 'student', false);
                
                // Add AI response if available
                if (message.response) {
                    appendMessage(message.response.response_text, 'tutor', false);
                }
            });
        }
        
        scrollToBottom();
    } catch (error) {
        console.error('Failed to load messages:', error);
        showError('Failed to load chat history');
    }
}

// Create and append a message element
function appendMessage(content, sender, saveToLocalStorage = true) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.innerHTML = sender === 'tutor' ? '🤖' : '👤';
    
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.textContent = content;
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(bubble);
    chatMessages.appendChild(messageElement);
    
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.innerHTML = `
        <div class="typing-bubble">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle sending messages
async function handleSendMessage() {
    console.log('handleSendMessage called');
    
    if (!messageInput.value.trim() || isProcessing || !currentSessionId) {
        console.log('Message not sent:', {
            emptyInput: !messageInput.value.trim(),
            isProcessing,
            noSessionId: !currentSessionId
        });
        return;
    }
    
    const content = messageInput.value.trim();
    messageInput.value = '';
    isProcessing = true;
    
    try {
        // Add user message to UI
        appendMessage(content, 'student');
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to backend API
        console.log('Sending message to session:', currentSessionId);
        const message = await apiService.sendMessage(currentSessionId, content);
        console.log('API response:', message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response if available
        if (message.response) {
            appendMessage(message.response.response_text, 'tutor');
        } else {
            console.log('No AI response in the message');
        }
    } catch (error) {
        console.error('Failed to send message:', error);
        showError(`Failed to send message: ${error.message}`);
        removeTypingIndicator();
    } finally {
        isProcessing = false;
    }
}

// Show error message
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
    chatMessages.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 5000);
}

// Scroll chat to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle logout
function handleLogout() {
    authService.logout();
    localStorage.removeItem(SESSION_ID_KEY);
    window.location.href = 'login.html';
}

// Start a new chat session
async function startNewChat() {
    try {
        // Confirm with the user
        if (!confirm('Start a new chat? This will begin a new conversation.')) {
            return;
        }
        
        // Create new session
        const newSession = await apiService.createSession('New Chat Session');
        currentSessionId = newSession.id;
        
        // Save the session ID
        localStorage.setItem(SESSION_ID_KEY, currentSessionId);
        
        // Clear messages
        chatMessages.innerHTML = '';
        
        console.log('Started new chat session:', currentSessionId);
    } catch (error) {
        console.error('Failed to start new chat:', error);
        showError('Failed to start a new chat');
    }
}

// Event Listeners
if (sendButton) {
    sendButton.addEventListener('click', () => {
        console.log('Send button clicked');
        handleSendMessage();
    });
} else {
    console.error('Send button not found!');
}

if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}

// New chat button (if it exists)
document.getElementById('newChatBtn')?.addEventListener('click', startNewChat);

// Initialize the chat
initializeChat(); 