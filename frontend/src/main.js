import { apiService } from './services/api.js';
import { authService } from './services/auth.js';
import { debugChatUI } from './debug.js';
import { createNotesTemplate } from './notes-template.js';
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

// Helper function to format date for filenames
function formatDateForFilename() {
    const now = new Date();
    return now.toISOString().split('T')[0];  // YYYY-MM-DD format
}

// Toggle export dropdown
function toggleExportDropdown() {
    const dropdown = document.getElementById('exportDropdown');
    dropdown.classList.toggle('hidden');
}

// Export chat as markdown notes
async function exportChatAsMarkdown() {
    try {
        if (!currentSessionId) {
            showError('No active chat session to export');
            return;
        }
        
        // Get messages for current session
        const messages = await apiService.getMessages(currentSessionId);
        
        if (messages.length === 0) {
            showError('No messages to export');
            return;
        }
        
        // Find current session title
        const sessions = await apiService.getSessions();
        const currentSession = sessions.find(session => session.id === currentSessionId);
        let sessionTitle = currentSession?.title || 'UPSC Study Notes';
        
        // Format the session title for the notes
        const titleDate = sessionTitle.includes(' - ') ? sessionTitle.split(' - ')[1] : formatDateForFilename();
        
        // Build content in Markdown format
        let notesContent = `# UPSC Study Notes - ${titleDate}\n\n`;
        notesContent += `*Generated on ${new Date().toLocaleString()}*\n\n`;
        notesContent += `## Session Overview\n`;
        notesContent += `This document contains notes from a UPSC tutoring session focused on exam preparation.\n\n`;
        notesContent += `---\n\n`;
        
        // Add all Q&A pairs
        messages.forEach((message, index) => {
            // Add question with topic prefix
            notesContent += `## Question ${index + 1}:\n\`\`\`\n${message.content}\n\`\`\`\n\n`;
            
            // Add answer if available
            if (message.response) {
                notesContent += `### Answer:\n${message.response.response_text}\n\n`;
            }
            
            // Add separator between Q&A pairs
            notesContent += `---\n\n`;
        });
        
        // Add study tips section at the end
        notesContent += `## Study Tips\n\n`;
        notesContent += `1. **Review regularly**: Go through these notes at least once a week\n`;
        notesContent += `2. **Make flashcards**: Convert key concepts into question-answer flashcards\n`;
        notesContent += `3. **Practice writing**: Write concise answers to the questions covered\n`;
        notesContent += `4. **Connect concepts**: Look for connections between different topics\n\n`;
        
        // Create a download link
        const blob = new Blob([notesContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `UPSC_Notes_${titleDate.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Show success message
        showSuccess('Notes exported as Markdown successfully!');
        
    } catch (error) {
        console.error('Failed to export notes:', error);
        showError('Failed to export notes. Please try again.');
    }
}

// Export chat as handwritten-style PDF notes
async function exportChatAsPdf() {
    try {
        if (!currentSessionId) {
            showError('No active chat session to export');
            return;
        }
        
        // Show loading message
        showInfo('Generating PDF, please wait...');
        
        // Get messages for current session
        const messages = await apiService.getMessages(currentSessionId);
        
        if (messages.length === 0) {
            showError('No messages to export');
            return;
        }
        
        // Find current session title
        const sessions = await apiService.getSessions();
        const currentSession = sessions.find(session => session.id === currentSessionId);
        let sessionTitle = currentSession?.title || 'UPSC Study Notes';
        
        // Format the session title for the notes
        const titleDate = sessionTitle.includes(' - ') ? sessionTitle.split(' - ')[1] : formatDateForFilename();
        const fullTitle = `UPSC Study Notes - ${titleDate}`;
        
        // Create the HTML template for handwritten-style notes
        const htmlContent = createNotesTemplate(fullTitle, messages);
        
        // Create a temporary div to render the HTML
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        
        // Wait for fonts to load
        await document.fonts.ready;
        
        // Use html2canvas to capture the rendered content
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        
        // Get all elements that should be separate pages
        const noteContainer = container.querySelector('.notes-container');
        
        // Define A4 dimensions (in points)
        const a4Width = 595.28;
        const a4Height = 841.89;
        const margin = 20;
        const contentWidth = a4Width - (margin * 2);
        
        try {
            // Create canvas from the HTML content
            const canvas = await html2canvas(noteContainer, { 
                scale: 2, // Increase quality
                useCORS: true,
                allowTaint: true,
                logging: false
            });
            
            // Get canvas dimensions
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const imgWidth = contentWidth;
            const pageHeight = a4Height - (margin * 2);
            const imgHeight = canvas.height * (imgWidth / canvas.width);
            
            // Calculate the number of pages
            const pageCount = Math.ceil(imgHeight / pageHeight);
            
            // For each page, add the appropriate part of the image
            let heightLeft = imgHeight;
            let position = 0;
            let currentPage = 0;
            
            // Add first page
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, null, 'FAST', 0);
            heightLeft -= pageHeight;
            currentPage++;
            
            // Add subsequent pages if content is too long
            while (heightLeft > 0 && currentPage < pageCount) {
                // Add a new page
                pdf.addPage();
                
                // Position is negative to show the next part of the image
                // Multiply by currentPage to move down the image for each new page
                position = -currentPage * pageHeight;
                
                // Add image with the appropriate y-offset to show the next part
                pdf.addImage(
                    imgData, 
                    'JPEG', 
                    margin, // x position
                    position + margin, // y position (negative to move up)
                    imgWidth, // width
                    imgHeight, // full height
                    null, // alias
                    'FAST', // compression
                    0 // rotation
                );
                
                heightLeft -= pageHeight;
                currentPage++;
            }
            
            // Save PDF
            pdf.save(`UPSC_Notes_${titleDate.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`);
            
            // Show success message
            showSuccess('Notes exported as handwritten PDF! 📝');
        } catch (err) {
            console.error('Error generating PDF:', err);
            showError('Failed to generate PDF. Please try again.');
        }
        
        // Clean up
        document.body.removeChild(container);
    } catch (error) {
        console.error('Failed to export notes as PDF:', error);
        showError('Failed to export notes. Please try again.');
    }
}

// Show info message
function showInfo(message) {
    const infoElement = document.createElement('div');
    infoElement.classList.add('info-message');
    infoElement.textContent = message;
    chatMessages.appendChild(infoElement);
    scrollToBottom();
    return infoElement;
}

// Show success message
function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.classList.add('success-message');
    successElement.textContent = message;
    chatMessages.appendChild(successElement);
    scrollToBottom();
    setTimeout(() => {
        successElement.remove();
    }, 3000);
}

// Export dropdown toggle
document.getElementById('exportNotesBtn')?.addEventListener('click', toggleExportDropdown);

// Export as Markdown
document.getElementById('exportMarkdownBtn')?.addEventListener('click', () => {
    toggleExportDropdown();
    exportChatAsMarkdown();
});

// Export as PDF
document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
    toggleExportDropdown();
    exportChatAsPdf();
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('exportDropdown');
    const exportBtn = document.getElementById('exportNotesBtn');
    
    if (dropdown && !dropdown.classList.contains('hidden') && !exportBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Add routing functionality
function setupRouting() {
    const routes = {
        '/': initializeChat,
        '/current-affairs': () => {
            const currentAffairs = new CurrentAffairs();
            currentAffairs.initialize();
        },
        '/notes': () => {
            // Initialize notes functionality
            console.log('Notes page initialized');
        }
    };

    function handleRoute() {
        const path = window.location.pathname;
        const routeHandler = routes[path] || routes['/'];
        routeHandler();
    }

    // Handle initial route
    handleRoute();

    // Handle navigation
    window.addEventListener('popstate', handleRoute);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupSidebarToggle();
    setupRouting();
}); 