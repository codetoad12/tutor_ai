import { apiService } from './services/api.js';
import { authService } from './services/auth.js';
import { debugChatUI } from './debug.js';
import lottie from 'lottie-web';
import { marked } from 'marked';

// Constants for localStorage
const SESSION_ID_KEY = 'tutor_ai_current_session';

// Configure marked for safe rendering
marked.setOptions({
    breaks: true,       // Convert line breaks to <br>
    gfm: true,          // Enable GitHub Flavored Markdown
    headerIds: false,   // No auto-generated header IDs
    mangle: false,      // Don't escape HTML
    sanitize: false     // Don't sanitize, we trust the AI output
});

// After marked configuration and before the checkDjangoServer function
// Add sidebar toggle functionality
function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebar || !mainContent || !sidebarToggle) {
        console.error('Sidebar elements not found');
        return;
    }
    
    let sidebarOpen = true;
    
    // Function to toggle sidebar
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
        
        if (sidebarOpen) {
            sidebar.classList.remove('-translate-x-full');
            mainContent.classList.remove('ml-0');
            mainContent.classList.add('ml-64');
        } else {
            sidebar.classList.add('-translate-x-full');
            mainContent.classList.remove('ml-64');
            mainContent.classList.add('ml-0');
        }
    }
    
    // Toggle when button is clicked
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Auto-collapse on small screens
    function checkScreenSize() {
        if (window.innerWidth < 768 && sidebarOpen) {
            toggleSidebar();
        }
    }
    
    // Check on load
    checkScreenSize();
    
    // Check on resize
    window.addEventListener('resize', checkScreenSize);
}

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

// Set user name in header and sidebar
const user = authService.getUser();
if (user) {
    // Update username displays
    const userNameDisplays = document.querySelectorAll('.user-name');
    userNameDisplays.forEach(element => {
        if (element) {
            element.textContent = user.username || 'Student';
        }
    });
    
    // Update user initial
    const userInitial = document.querySelector('.user-initial');
    if (userInitial && user.username) {
        userInitial.textContent = user.username.charAt(0).toUpperCase();
    }
}

// Initialize the chat interface
async function initializeChat() {
    try {
        // Try to get existing session ID from localStorage
        const savedSessionId = localStorage.getItem(SESSION_ID_KEY);
        
        // Get current active sessions from the backend
        const sessions = await apiService.getSessions();
        console.log('Available sessions:', sessions);
        
        // Populate chat history sidebar
        populateChatHistory(sessions);
        
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
            
            // Create a descriptive title with date and time
            const now = new Date();
            const formattedDate = now.toLocaleDateString();
            const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sessionTitle = `UPSC Chat - ${formattedDate} ${formattedTime}`;
            
            const newSession = await apiService.createSession(sessionTitle);
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

// Helper function to extract date from session title
function getSessionDate(sessionTitle) {
    // Try to extract date from titles like "UPSC Chat - 6/5/2023 2:30 PM"
    const dateMatch = sessionTitle.match(/(\d+\/\d+\/\d+)/);
    if (dateMatch) {
        return dateMatch[1];
    }
    return null;
}

// Populate chat history in the sidebar
function populateChatHistory(sessions) {
    const chatHistoryContainer = document.getElementById('chatHistory');
    if (!chatHistoryContainer) {
        console.error('Chat history container not found');
        return;
    }
    
    // Clear existing history
    chatHistoryContainer.innerHTML = '';
    
    // Check if there are any sessions
    if (sessions.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('text-sm', 'text-gray-400', 'italic', 'px-2');
        emptyMessage.textContent = 'Your previous conversations will appear here';
        chatHistoryContainer.appendChild(emptyMessage);
        return;
    }
    
    // Add each session as a clickable item
    sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.classList.add('chat-history-item', 'rounded', 'hover:bg-gray-700', 'cursor-pointer', 'transition-colors');
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('flex', 'items-center', 'w-full');
        
        // Add chat icon
        const chatIcon = document.createElement('span');
        chatIcon.classList.add('mr-2', 'text-gray-400', 'flex-shrink-0');
        chatIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        `;
        
        // Create text content wrapper
        const textWrapper = document.createElement('div');
        textWrapper.classList.add('flex-1', 'overflow-hidden');
        
        // Add session title
        const title = document.createElement('div');
        title.classList.add('truncate', 'text-sm', 'font-medium');
        
        // Format session title
        let displayTitle;
        if (session.title && session.title.startsWith('UPSC Chat')) {
            // Use only the date/time part if it's our auto-generated title
            const parts = session.title.split(' - ');
            if (parts.length > 1) {
                displayTitle = parts[1];
            } else {
                displayTitle = session.title;
            }
        } else {
            displayTitle = session.title || `Chat ${session.id.substring(0, 8)}`;
        }
        
        title.textContent = displayTitle;
        
        // Add a subtitle with first few words of first message (if we had that data)
        const subtitle = document.createElement('div');
        subtitle.classList.add('truncate', 'text-xs', 'text-gray-400');
        subtitle.textContent = "UPSC study session";
        
        // Add elements to DOM
        textWrapper.appendChild(title);
        textWrapper.appendChild(subtitle);
        
        contentWrapper.appendChild(chatIcon);
        contentWrapper.appendChild(textWrapper);
        
        sessionItem.appendChild(contentWrapper);
        chatHistoryContainer.appendChild(sessionItem);
        
        // Add click handler to switch to this session
        sessionItem.addEventListener('click', async () => {
            if (currentSessionId !== session.id) {
                currentSessionId = session.id;
                localStorage.setItem(SESSION_ID_KEY, currentSessionId);
                await loadMessagesForSession(currentSessionId);
                
                // Update active state in UI
                document.querySelectorAll('.chat-history-item').forEach(item => {
                    item.classList.remove('bg-gray-700');
                });
                sessionItem.classList.add('bg-gray-700');
            }
        });
        
        // Highlight current session
        if (session.id === currentSessionId) {
            sessionItem.classList.add('bg-gray-700');
        }
    });
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
            // Add AI welcome message with markdown
            appendMessage(`# Welcome to AI Tutor!

I'm your **UPSC exam mentor and tutor**. Here's how I can help you:

- Answer questions about **UPSC exam preparation**
- Explain complex topics in simple terms
- Provide study strategies and exam tips
- Share important information about the syllabus

Try asking me a question about any UPSC topic!`, 'tutor', false);
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
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.innerHTML = sender === 'tutor' ? '🤖' : '👤';
    
    // Create container for bubble and timestamp
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('message-content');
    
    // Create message bubble
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    
    if (sender === 'tutor') {
        // Use markdown for AI responses
        bubble.classList.add('markdown-content');
        bubble.innerHTML = marked.parse(content);
    } else {
        // Plain text for user messages
        bubble.textContent = content;
    }
    
    // Create timestamp
    const timestamp = document.createElement('div');
    timestamp.classList.add('message-timestamp');
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Assemble message
    contentContainer.appendChild(bubble);
    contentContainer.appendChild(timestamp);
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(contentContainer);
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
        
        // Create a descriptive title with date and time
        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sessionTitle = `UPSC Chat - ${formattedDate} ${formattedTime}`;
        
        // Create new session
        const newSession = await apiService.createSession(sessionTitle);
        currentSessionId = newSession.id;
        
        // Save the session ID
        localStorage.setItem(SESSION_ID_KEY, currentSessionId);
        
        // Clear messages
        chatMessages.innerHTML = '';
        
        // Add welcome message
        appendMessage(`# Welcome to AI Tutor!

I'm your **UPSC exam mentor and tutor**. Here's how I can help you:

- Answer questions about **UPSC exam preparation**
- Explain complex topics in simple terms
- Provide study strategies and exam tips
- Share important information about the syllabus

Try asking me a question about any UPSC topic!`, 'tutor', false);
        
        console.log('Started new chat session:', currentSessionId);
        
        // Update chat history in the sidebar
        const sessions = await apiService.getSessions();
        populateChatHistory(sessions);
    } catch (error) {
        console.error('Failed to start new chat:', error);
        showError('Failed to start a new chat');
    }
}

// Clear chat content
function clearChat() {
    if (confirm('Are you sure you want to clear the chat? This will only clear the messages from your screen, not from the server.')) {
        chatMessages.innerHTML = '';
        
        // Add AI welcome message with markdown
        appendMessage(`# Welcome to AI Tutor!

I'm your **UPSC exam mentor and tutor**. Here's how I can help you:

- Answer questions about **UPSC exam preparation**
- Explain complex topics in simple terms
- Provide study strategies and exam tips
- Share important information about the syllabus

Try asking me a question about any UPSC topic!`, 'tutor', false);
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

// Clear chat button
document.getElementById('clearChatBtn')?.addEventListener('click', clearChat);

// Initialize the chat
initializeChat();

// Setup sidebar toggle
setupSidebarToggle(); 