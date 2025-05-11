import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import { FaPlus, FaTrash, FaDownload, FaFileAlt, FaFilePdf, FaRegClock, FaExclamationTriangle } from 'react-icons/fa';
import { apiService } from '../../services/api';
import { authService } from '../../services/auth';

// Configure marked for safe rendering
marked.setOptions({
    breaks: true,       // Convert line breaks to <br>
    gfm: true,          // Enable GitHub Flavored Markdown
    headerIds: false,   // No auto-generated header IDs
    mangle: false,      // Don't escape HTML
    sanitize: false     // Don't sanitize, we trust the AI output
});

const ChatInterface = () => {
    // State Management
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errorState, setErrorState] = useState(null);
    
    const messagesEndRef = useRef(null);
    const chatMessagesRef = useRef(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat interface - load sessions and messages
    useEffect(() => {
        const initializeChat = async () => {
            try {
                // Only proceed if user is authenticated
                if (!authService.isAuthenticated()) {
                    return;
                }
                
                setInitialLoading(true);
                setErrorState(null);
                
                // Load available sessions
                const availableSessions = await apiService.getSessions();
                setSessions(availableSessions);
                
                // Determine which session to use (most recent or create new)
                let sessionId;
                
                // Try to get from localStorage
                const savedSessionId = localStorage.getItem('current_chat_session');
                
                if (savedSessionId && availableSessions.some(s => s.id.toString() === savedSessionId)) {
                    // Use saved session if it exists
                    sessionId = savedSessionId;
                } else if (availableSessions.length > 0) {
                    // Use the most recent session
                    sessionId = availableSessions[0].id.toString();
                } else {
                    // Create a new session
                    const now = new Date();
                    const formattedDate = now.toLocaleDateString();
                    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const title = `UPSC Chat - ${formattedDate} ${formattedTime}`;
                    
                    const newSession = await apiService.createSession(title);
                    sessionId = newSession.id.toString();
                    setSessions(prev => [newSession, ...prev]);
                }
                
                // Set current session and save to localStorage
                setCurrentSessionId(sessionId);
                localStorage.setItem('current_chat_session', sessionId);
                
                // Load messages for the session
                await loadMessagesForSession(sessionId);
                
            } catch (error) {
                console.error('Error initializing chat:', error);
                setErrorState({
                    message: 'Failed to initialize chat. Please try refreshing the page.',
                    details: error.toString()
                });
                // Show error message as an AI message
                setMessages([{
                    role: 'assistant',
                    content: 'Sorry, there was an error loading the chat. Please try refreshing the page.'
                }]);
            } finally {
                setInitialLoading(false);
            }
        };
        
        initializeChat();
    }, []);

    // Load messages for a specific session
    const loadMessagesForSession = async (sessionId) => {
        try {
            setMessages([]); // Clear current messages
            
            // Get messages from API
            const sessionMessages = await apiService.getMessages(sessionId);
            
            // If no messages, show welcome message
            if (sessionMessages.length === 0) {
                setMessages([{
                    role: 'assistant',
                    content: `# Welcome to AI Tutor!

I'm your **UPSC exam mentor and tutor**. Here's how I can help you:

- Answer questions about **UPSC exam preparation**
- Explain complex topics in simple terms
- Provide study strategies and exam tips
- Share important information about the syllabus

Try asking me a question about any UPSC topic!`
                }]);
            } else {
                // Transform messages from API format to our component format
                const formattedMessages = [];
                
                sessionMessages.forEach(message => {
                    // Add user message
                    formattedMessages.push({
                        role: 'user',
                        content: message.content,
                        timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                    
                    // Add AI response if available
                    if (message.response) {
                        formattedMessages.push({
                            role: 'assistant',
                            content: message.response.response_text,
                            timestamp: new Date(message.response.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        });
                    }
                });
                
                setMessages(formattedMessages);
            }
            
            scrollToBottom();
        } catch (error) {
            console.error('Error loading messages:', error);
            setErrorState({
                message: 'Failed to load messages.',
                details: error.toString()
            });
            setMessages([{
                role: 'assistant',
                content: 'Sorry, there was an error loading the chat messages.'
            }]);
        }
    };

    // Handle sending a message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !currentSessionId) return;

        const userInput = input.trim();
        const userMessage = { role: 'user', content: userInput, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        
        // Add user message to UI immediately
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setErrorState(null);

        try {
            // Send message to backend API
            const response = await apiService.sendMessage(currentSessionId, userInput);
            
            // Add AI response to the UI
            if (response && response.response) {
                const aiResponse = {
                    role: 'assistant',
                    content: response.response.response_text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    model: response.response.model_name || 'unknown'
                };
                
                setMessages(prev => [...prev, aiResponse]);
                
                // Update session in the list to show it's the most recent
                setSessions(prev => {
                    const updatedSession = prev.find(s => s.id.toString() === currentSessionId);
                    if (updatedSession) {
                        // Move this session to the top of the list
                        const otherSessions = prev.filter(s => s.id.toString() !== currentSessionId);
                        return [updatedSession, ...otherSessions];
                    }
                    return prev;
                });
            } else {
                // Handle case where response has no AI response
                throw new Error('No AI response received');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Handle quota/rate limit errors
            const errorMsg = error.toString().toLowerCase();
            let errorContent = 'Sorry, there was an error processing your message. Please try again.';
            
            // Check for specific error messages
            if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
                errorContent = `## Service Temporarily Unavailable

I apologize, but the AI service is currently experiencing high demand and has reached its quota limit. 

**What you can do:**
- Try again in a few minutes
- Your message has been saved, but the AI couldn't generate a response at this time
- The system admin may need to upgrade the API quota for uninterrupted service`;

                setErrorState({
                    message: 'AI quota limit reached',
                    details: error.toString(),
                    isQuotaError: true
                });
            } else {
                setErrorState({
                    message: 'Error sending message',
                    details: error.toString()
                });
            }
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorContent,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Start a new chat session
    const startNewChat = async () => {
        if (window.confirm('Start a new chat? This will begin a new conversation.')) {
            try {
                setLoading(true);
                setErrorState(null);
                
                // Create a new session with current date/time
                const now = new Date();
                const formattedDate = now.toLocaleDateString();
                const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const title = `UPSC Chat - ${formattedDate} ${formattedTime}`;
                
                // Create new session via API
                const newSession = await apiService.createSession(title);
                
                // Update session list
                setSessions(prev => [newSession, ...prev]);
                
                // Update current session
                setCurrentSessionId(newSession.id.toString());
                localStorage.setItem('current_chat_session', newSession.id.toString());
                
                // Clear messages and add welcome message
                setMessages([{
                    role: 'assistant',
                    content: `# Welcome to AI Tutor!

I'm your **UPSC exam mentor and tutor**. Here's how I can help you:

- Answer questions about **UPSC exam preparation**
- Explain complex topics in simple terms
- Provide study strategies and exam tips
- Share important information about the syllabus

Try asking me a question about any UPSC topic!`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } catch (error) {
                console.error('Error creating new chat:', error);
                setErrorState({
                    message: 'Failed to create new chat',
                    details: error.toString()
                });
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, there was an error creating a new chat session.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isError: true
                }]);
            } finally {
                setLoading(false);
            }
        }
    };

    // Clear chat (keep the session but clear messages)
    const clearChat = () => {
        if (window.confirm('Are you sure you want to clear the chat? This will only clear the messages from your screen, not from the server.')) {
            setMessages([{
                role: 'assistant',
                content: `# Welcome to AI Tutor!

I'm your **UPSC exam mentor and tutor**. Here's how I can help you:

- Answer questions about **UPSC exam preparation**
- Explain complex topics in simple terms
- Provide study strategies and exam tips
- Share important information about the syllabus

Try asking me a question about any UPSC topic!`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    // Export chat as markdown
    const exportChatAsMarkdown = () => {
        try {
            const now = new Date();
            const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Build content in Markdown format
            let notesContent = `# UPSC Study Notes - ${formattedDate}\n\n`;
            notesContent += `*Generated on ${now.toLocaleString()}*\n\n`;
            notesContent += `## Session Overview\n`;
            notesContent += `This document contains notes from a UPSC tutoring session focused on exam preparation.\n\n`;
            notesContent += `---\n\n`;
            
            // Add all Q&A pairs
            let questionCount = 1;
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                if (message.role === 'user') {
                    notesContent += `## Question ${questionCount}:\n\`\`\`\n${message.content}\n\`\`\`\n\n`;
                    
                    // Look for the next assistant message as the answer
                    if (i + 1 < messages.length && messages[i + 1].role === 'assistant') {
                        notesContent += `### Answer:\n${messages[i + 1].content}\n\n`;
                        notesContent += `---\n\n`;
                        questionCount++;
                    }
                }
            }
            
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
            a.download = `UPSC_Notes_${formattedDate}.md`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // Show success message as a temporary message
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Notes exported as Markdown successfully!',
                temporary: true
            }]);
            
            // Remove temporary message after 3 seconds
            setTimeout(() => {
                setMessages(prev => prev.filter(msg => !msg.temporary));
            }, 3000);
            
        } catch (error) {
            console.error('Failed to export notes:', error);
            setErrorState({
                message: 'Failed to export notes',
                details: error.toString()
            });
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Failed to export notes. Please try again.',
                temporary: true,
                error: true
            }]);
            
            // Remove temporary message after 3 seconds
            setTimeout(() => {
                setMessages(prev => prev.filter(msg => !msg.temporary));
            }, 3000);
        }
    };

    // Toggle the export dropdown
    const toggleExportDropdown = () => {
        setExportDropdownOpen(prev => !prev);
    };

    // Switch to a different session
    const switchSession = async (sessionId) => {
        if (currentSessionId !== sessionId) {
            try {
                setLoading(true);
                setErrorState(null);
                setCurrentSessionId(sessionId);
                localStorage.setItem('current_chat_session', sessionId);
                
                // Load messages for selected session
                await loadMessagesForSession(sessionId);
            } catch (error) {
                console.error('Error switching sessions:', error);
                setErrorState({
                    message: 'Failed to load chat session',
                    details: error.toString()
                });
                setMessages([{
                    role: 'assistant',
                    content: 'Sorry, there was an error loading the chat session.'
                }]);
            } finally {
                setLoading(false);
            }
        }
    };

    // Retry sending the last user message if there was an error
    const retryLastMessage = () => {
        // Find the last user message
        const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.role === 'user');
        
        if (lastUserMessageIndex >= 0) {
            const lastUserMessage = [...messages].reverse()[lastUserMessageIndex];
            
            // Remove the error message
            setMessages(prev => prev.slice(0, prev.length - 1));
            
            // Resend the message
            handleSendMessage({
                preventDefault: () => {},
                target: { value: lastUserMessage.content }
            });
            
            // Update input field with the message for visibility
            setInput(lastUserMessage.content);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
                    <p className="text-gray-600">Loading chat interface...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div id="sidebar" className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full shadow-lg">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">AI Tutor</h2>
                    <p className="text-gray-400 text-sm">UPSC Preparation Assistant</p>
                </div>
                
                {/* New Chat Button */}
                <button 
                    onClick={startNewChat} 
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-6 transition-colors"
                    disabled={loading}
                >
                    <FaPlus />
                    <span>New Chat</span>
                </button>
                
                {/* Chat History */}
                <div className="mb-4">
                    <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-2">Chat History</h3>
                    <div id="chatHistory" className="space-y-1 max-h-80 overflow-y-auto pr-1">
                        {sessions.length > 0 ? (
                            sessions.map(session => (
                                <div 
                                    key={session.id} 
                                    className={`chat-history-item px-3 py-2 ${currentSessionId === session.id.toString() ? 'bg-gray-700' : ''}`}
                                    onClick={() => switchSession(session.id.toString())}
                                >
                                    <div className="flex items-center w-full">
                                        <span className="mr-2 text-gray-400 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                        </span>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="truncate text-sm font-medium">
                                                {session.title.split(' - ')[1] || session.title}
                                            </div>
                                            <div className="truncate text-xs text-gray-400">
                                                UPSC study session
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 italic px-2">
                                Your previous conversations will appear here
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Actions */}
                <div className="mt-auto">
                    <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-2">Actions</h3>
                    <div className="space-y-1">
                        <button 
                            onClick={clearChat}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors text-sm"
                            disabled={loading}
                        >
                            <FaTrash className="text-gray-400" />
                            <span>Clear Chat</span>
                        </button>
                        
                        <div className="relative">
                            <button 
                                onClick={toggleExportDropdown}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors text-sm"
                                disabled={loading}
                            >
                                <FaDownload className="text-gray-400" />
                                <span>Export Notes</span>
                            </button>
                            
                            {exportDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-full bg-gray-700 rounded shadow-lg overflow-hidden">
                                    <button 
                                        onClick={() => {
                                            toggleExportDropdown();
                                            exportChatAsMarkdown();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-600 text-sm"
                                    >
                                        <FaFileAlt className="text-gray-400" />
                                        <span>As Markdown</span>
                                    </button>
                                    <button 
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-600 text-sm"
                                    >
                                        <FaFilePdf className="text-gray-400" />
                                        <span>As PDF</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div id="mainContent" className="flex-1 flex flex-col ml-64">
                {/* Error Banner (if applicable) */}
                {errorState && errorState.isQuotaError && (
                    <div className="bg-amber-50 border-t-4 border-amber-500 p-3 shadow-md">
                        <div className="flex items-center">
                            <div className="py-1 text-amber-500">
                                <FaExclamationTriangle className="text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-amber-700">
                                    API Quota Limit Reached
                                </p>
                                <p className="text-xs text-amber-600">
                                    The AI service is currently at capacity. Messages can be sent but responses may be delayed.
                                </p>
                            </div>
                            <div className="ml-auto">
                                <button 
                                    onClick={() => setErrorState(null)} 
                                    className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            
                {/* Chat Container */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Chat Messages */}
                    <div 
                        ref={chatMessagesRef}
                        className="chat-messages flex-1 overflow-y-auto p-4 space-y-4"
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.role === 'user' ? 'student-message' : 'tutor-message'} ${message.temporary ? (message.error ? 'error-message' : 'success-message') : ''}`}
                            >
                                {!message.temporary && (
                                    <div className="avatar">
                                        {message.role === 'user' ? '👤' : '🤖'}
                                    </div>
                                )}
                                
                                <div className="message-content">
                                    {message.temporary ? (
                                        <div className={`${message.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} p-4 rounded-lg text-center`}>
                                            {message.content}
                                        </div>
                                    ) : (
                                        <>
                                            <div 
                                                className={`message-bubble ${message.role === 'user' ? '' : 'markdown-content'} ${message.isError ? 'error-bubble' : ''}`}
                                                dangerouslySetInnerHTML={message.role === 'user' ? undefined : { __html: marked.parse(message.content) }}
                                            >
                                                {message.role === 'user' ? message.content : null}
                                            </div>
                                            <div className="message-timestamp">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <FaRegClock className="mr-1" size={10} />
                                                    {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {message.model && <span className="ml-2 opacity-75">{message.model}</span>}
                                                </div>
                                            </div>
                                            
                                            {/* Retry button for error messages */}
                                            {message.isError && message.role === 'assistant' && index === messages.length - 1 && (
                                                <button 
                                                    onClick={retryLastMessage}
                                                    className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    Retry
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="typing-indicator">
                                <div className="avatar">🤖</div>
                                <div className="typing-bubble">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything about UPSC preparation..."
                                className="flex-1 p-3 resize-none outline-none"
                                rows="2"
                                disabled={loading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                            >
                                Send
                            </button>
                        </div>
                        
                        {/* API status indicator */}
                        {errorState && errorState.isQuotaError && (
                            <div className="mt-2 text-xs text-amber-700 flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                AI service at capacity - responses may be delayed
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface; 