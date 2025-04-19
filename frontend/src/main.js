import { apiService } from './services/api.js';
import { authService } from './services/auth.js';
import { debugChatUI } from './debug.js';
import lottie from 'lottie-web';

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
        // Create a new session or get the latest one
        const sessions = await apiService.getSessions();
        if (sessions.length > 0) {
            currentSessionId = sessions[0].id;
            loadMessages(currentSessionId);
        } else {
            const newSession = await apiService.createSession('New Chat Session');
            currentSessionId = newSession.id;
        }
    } catch (error) {
        console.error('Failed to initialize chat:', error);
        showError('Failed to connect to the chat service');
    }
}

// Load existing messages
async function loadMessages(sessionId) {
    try {
        const messages = await apiService.getMessages(sessionId);
        messages.forEach(message => {
            appendMessage(message.content, 'student');
            if (message.response) {
                appendMessage(message.response.response_text, 'tutor');
            }
        });
        scrollToBottom();
    } catch (error) {
        console.error('Failed to load messages:', error);
        showError('Failed to load chat history');
    }
}

// Create and append a message element
function appendMessage(content, sender) {
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
    console.log('Message input value:', messageInput.value);
    console.log('Is processing:', isProcessing);
    console.log('Current session ID:', currentSessionId);
    
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
        console.log('Appending student message to UI');
        appendMessage(content, 'student');
        console.log('Showing typing indicator');
        showTypingIndicator();
        
        console.log('Sending message to API:', content);
        const response = await apiService.sendMessage(currentSessionId, content);
        console.log('API response received:', response);
        
        console.log('Removing typing indicator');
        removeTypingIndicator();
        
        if (response.response) {
            console.log('Appending tutor response to UI');
            appendMessage(response.response.response_text, 'tutor');
        } else {
            console.log('No response in API response');
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
    window.location.href = 'login.html';
}

// Event Listeners
console.log('Setting up event listeners...');
console.log('Send button element:', sendButton);

if (sendButton) {
    sendButton.addEventListener('click', () => {
        console.log('Send button clicked');
        handleSendMessage();
    });
} else {
    console.error('Send button element not found!');
    // Try to find the send button again
    const sendButtonRetry = document.querySelector('.send-button');
    console.log('Retry finding send button:', sendButtonRetry);
    if (sendButtonRetry) {
        sendButtonRetry.addEventListener('click', () => {
            console.log('Send button clicked (retry)');
            handleSendMessage();
        });
    }
}

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        console.log('Enter key pressed in message input');
        handleSendMessage();
    }
});

if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}

// Initialize the chat
initializeChat(); 