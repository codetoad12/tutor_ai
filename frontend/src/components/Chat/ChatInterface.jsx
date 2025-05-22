import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import { FaPlus, FaTrash, FaDownload, FaFileAlt, FaFilePdf, FaRegClock, FaExclamationTriangle, FaArrowLeft, FaChalkboardTeacher, FaEraser, FaBook, FaPencilAlt } from 'react-icons/fa';
import { apiService } from '../../services/api';
import { authService } from '../../services/auth';
import './ChatInterface.css'; // We'll create this CSS file for custom styles
import { createNotesTemplate } from '../../notes-template';

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
                    // Update localStorage with the most recent session
                    localStorage.setItem('current_chat_session', sessionId);
                } else {
                    // Create a new session
                    const now = new Date();
                    const formattedDate = now.toLocaleDateString();
                    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const title = `UPSC Chat - ${formattedDate} ${formattedTime}`;
                    
                    const newSession = await apiService.createSession(title);
                    sessionId = newSession.id.toString();
                    
                    // Refresh the sessions list after creating a new session
                    const updatedSessions = await apiService.getSessions();
                    setSessions(updatedSessions);
                    
                    // Update localStorage with the new session
                    localStorage.setItem('current_chat_session', sessionId);
                }
                
                // Set current session
                setCurrentSessionId(sessionId);
                
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
                    content: `# Welcome to your UPSC Virtual Classroom!

I'm your **UPSC exam mentor and teacher**. This blackboard is our space to explore and learn together.

Let me help you with:

- Explaining **complex UPSC topics** in clear, simple terms
- Providing **structured study strategies** and exam techniques
- Breaking down the **complete UPSC syllabus** into manageable segments
- Offering **practice questions** and detailed feedback

What topic would you like to explore today?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                
                // Refresh the sessions list to ensure it shows the latest activity
                const updatedSessions = await apiService.getSessions();
                setSessions(updatedSessions);
            } else {
                // Handle error if no response
                setErrorState({
                    message: 'No response received from the server',
                    details: 'The server returned an empty response'
                });
                
                // Add error message to chat
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, I wasn\'t able to get a response. Please try again.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isError: true
                }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Check if it's a rate limit error
            let errorMessage = 'Sorry, there was an error processing your request.';
            
            if (error.message && error.message.includes('429')) {
                errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
            }
            
            setErrorState({
                message: 'Failed to send message',
                details: error.toString()
            });
            
            // Add error message to chat
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true,
                isRateLimit: error.message && error.message.includes('429')
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
                
                // Fetch the latest sessions list to ensure it's up to date
                const updatedSessions = await apiService.getSessions();
                setSessions(updatedSessions);
                
                // Update current session
                setCurrentSessionId(newSession.id.toString());
                localStorage.setItem('current_chat_session', newSession.id.toString());
                
                // Clear messages and add welcome message
                setMessages([{
                    role: 'assistant',
                    content: `# Welcome to your UPSC Virtual Classroom!

I'm your **UPSC exam mentor and teacher**. This blackboard is our space to explore and learn together.

Let me help you with:

- Explaining **complex UPSC topics** in clear, simple terms
- Providing **structured study strategies** and exam techniques
- Breaking down the **complete UPSC syllabus** into manageable segments
- Offering **practice questions** and detailed feedback

What topic would you like to explore today?`,
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
                content: `# Welcome to your UPSC Virtual Classroom!

I'm your **UPSC exam mentor and teacher**. This blackboard is our space to explore and learn together.

Let me help you with:

- Explaining **complex UPSC topics** in clear, simple terms
- Providing **structured study strategies** and exam techniques
- Breaking down the **complete UPSC syllabus** into manageable segments
- Offering **practice questions** and detailed feedback

What topic would you like to explore today?`,
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

    // Export chat as handwritten notes
    const exportChatAsHandwrittenNotes = () => {
        try {
            // Prepare the messages for the notes template
            const notesMessages = [];
            
            // Process messages into question-answer pairs
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                if (message.role === 'user') {
                    const noteItem = {
                        content: message.content
                    };
                    
                    // Look for the next assistant message as the answer
                    if (i + 1 < messages.length && messages[i + 1].role === 'assistant') {
                        noteItem.response = {
                            response_text: messages[i + 1].content
                        };
                    }
                    
                    notesMessages.push(noteItem);
                }
            }
            
            // Get current session title
            const currentSession = sessions.find(s => s.id.toString() === currentSessionId);
            const title = currentSession ? currentSession.title : 'UPSC Study Notes';
            
            // Generate HTML for the notes
            const notesHtml = createNotesTemplate(title, notesMessages);
            
            // Create a Blob and download
            const blob = new Blob([notesHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `UPSC_Handwritten_Notes_${new Date().toISOString().split('T')[0]}.html`;
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
                content: 'Handwritten notes exported successfully!',
                temporary: true
            }]);
            
            // Remove temporary message after 3 seconds
            setTimeout(() => {
                setMessages(prev => prev.filter(msg => !msg.temporary));
            }, 3000);
            
        } catch (error) {
            console.error('Failed to export handwritten notes:', error);
            setErrorState({
                message: 'Failed to export handwritten notes',
                details: error.toString()
            });
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Failed to export handwritten notes. Please try again.',
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
                
                // Set current session ID
                setCurrentSessionId(sessionId);
                localStorage.setItem('current_chat_session', sessionId);
                
                // Refresh sessions list to ensure it's up to date
                const updatedSessions = await apiService.getSessions();
                setSessions(updatedSessions);
                
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

    // Function to navigate back to main app
    const navigateToMain = () => {
        // Navigate to the main application view
        window.location.href = '/';
    };

    if (initialLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-blackboard">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-chalk mb-4"></div>
                    <p className="text-chalk font-chalk">Loading virtual classroom...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-blackboard">
            {/* Sidebar */}
            <div id="sidebar" className="w-64 bg-sidebar-dark text-chalk p-4 flex flex-col h-screen shadow-lg fixed left-0 top-0 z-10 overflow-y-auto font-chalk">
                {/* New Chat Button */}
                <button 
                    onClick={startNewChat} 
                    className="flex items-center gap-2 bg-green-800 hover:bg-green-700 text-chalk px-4 py-2 rounded-lg mb-6 transition-colors border border-chalk-dim"
                    disabled={loading}
                >
                    <FaChalkboardTeacher />
                    <span>New Lesson</span>
                </button>
                
                {/* Chat History */}
                <div className="mb-4 overflow-y-auto">
                    <h3 className="text-chalk-dim uppercase text-xs font-semibold tracking-wider mb-2">Lesson History</h3>
                    <div id="chatHistory" className="space-y-1 max-h-80 overflow-y-auto pr-1 scrollbar-chalk">
                        {sessions.length > 0 ? (
                            sessions.map(session => (
                                <div 
                                    key={session.id} 
                                    className={`chat-history-item px-3 py-2 ${currentSessionId === session.id.toString() ? 'bg-green-900' : ''} cursor-pointer hover:bg-green-900 transition-colors rounded border-l-2 ${currentSessionId === session.id.toString() ? 'border-chalk' : 'border-transparent'}`}
                                    onClick={() => switchSession(session.id.toString())}
                                >
                                    <div className="flex items-center w-full">
                                        <span className="mr-2 text-chalk-dim flex-shrink-0">
                                            <FaBook className="h-4 w-4" />
                                        </span>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="truncate text-sm font-medium">
                                                {session.title.split(' - ')[1] || session.title}
                                            </div>
                                            <div className="truncate text-xs text-chalk-dim">
                                                UPSC study session
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-chalk-dim italic px-2">
                                Your previous lessons will appear here
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Actions */}
                <div className="mt-auto">
                    <h3 className="text-chalk-dim uppercase text-xs font-semibold tracking-wider mb-2">Actions</h3>
                    <div className="space-y-1">
                        <button 
                            onClick={clearChat}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-900 rounded transition-colors text-sm"
                            disabled={loading}
                        >
                            <FaEraser className="text-chalk-dim" />
                            <span>Clear Board</span>
                        </button>
                        
                        <div className="relative">
                            <button 
                                onClick={toggleExportDropdown}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-900 rounded transition-colors text-sm"
                                disabled={loading}
                            >
                                <FaDownload className="text-chalk-dim" />
                                <span>Export Notes</span>
                            </button>
                            
                            {exportDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-full bg-green-900 rounded shadow-lg overflow-hidden border border-chalk-dim">
                                    <button 
                                        onClick={() => {
                                            toggleExportDropdown();
                                            exportChatAsMarkdown();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-800 text-sm"
                                    >
                                        <FaFileAlt className="text-chalk-dim" />
                                        <span>As Markdown</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            toggleExportDropdown();
                                            exportChatAsHandwrittenNotes();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-800 text-sm"
                                    >
                                        <FaPencilAlt className="text-chalk-dim" />
                                        <span>As Handwritten Notes</span>
                                    </button>
                                    <button 
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-800 text-sm"
                                    >
                                        <FaFilePdf className="text-chalk-dim" />
                                        <span>As PDF</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Chat Content - Using absolute right-0 to ensure it fills all available space */}
            <div className="absolute left-64 right-0 h-screen flex flex-col bg-blackboard">
                {/* Top Navigation Bar */}
                <div className="h-14 bg-sidebar-dark border-b border-chalk-dim flex items-center justify-between px-4 w-full shadow-md">
                    <button 
                        onClick={navigateToMain}
                        className="flex items-center text-chalk hover:text-white transition-colors font-chalk"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span>Back to Dashboard</span>
                    </button>
                    
                    {/* Session title display */}
                    {currentSessionId && sessions.length > 0 && (
                        <div className="text-chalk font-chalk font-medium">
                            {sessions.find(s => s.id.toString() === currentSessionId)?.title || 'UPSC Classroom Session'}
                        </div>
                    )}
                </div>
                
                {/* Error Banner (if applicable) */}
                {errorState && errorState.isQuotaError && (
                    <div className="bg-yellow-900 border-l-4 border-yellow-600 p-3 mx-auto my-2 w-full max-w-3xl shadow-sm">
                        <div className="flex items-center">
                            <div className="text-yellow-500 mr-3">
                                <FaExclamationTriangle />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-yellow-500 font-chalk">
                                    API Quota Limit Reached
                                </p>
                                <p className="text-xs text-yellow-400 font-chalk">
                                    The AI service is currently at capacity. Messages can be sent but responses may be delayed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Messages Container */}
                <div 
                    ref={chatMessagesRef}
                    className="flex-1 overflow-y-auto px-4 py-6 scrollbar-chalk w-full" 
                    style={{ 
                        backgroundColor: 'var(--blackboard)', /* Use the CSS variable */
                        height: 'calc(100vh - 144px)', /* Subtract top bar and input heights */
                        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0)',
                        backgroundSize: '30px 30px',
                    }}
                >
                    <div className="max-w-5xl mx-auto space-y-6 pb-24">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-700 text-chalk mr-3 flex-shrink-0">
                                        👨‍🏫
                                    </div>
                                )}
                                
                                <div className={`message-content max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'} ${message.role === 'assistant' ? 'chalk-text' : ''}`}>
                                    <div 
                                        className={`p-4 rounded-lg ${
                                            message.role === 'user' 
                                                ? 'bg-blue-900 text-chalk rounded-tr-none chalk-student-bubble' 
                                                : 'bg-transparent text-chalk rounded-tl-none border-l-4 border-l-yellow-600 chalk-teacher-text'
                                        } ${message.isError ? 'border-red-500 bg-red-900 text-red-200' : ''}`}
                                    >
                                        {message.role === 'user' ? (
                                            message.content
                                        ) : (
                                            <div 
                                                className="markdown-content chalk-text" 
                                                dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }}
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="mt-1 text-xs text-chalk-dim flex font-chalk">
                                        <span className="mr-2">{message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {message.model && <span className="opacity-75 italic">{message.model}</span>}
                                    </div>
                                    
                                    {/* Retry button for error messages */}
                                    {message.isError && message.role === 'assistant' && index === messages.length - 1 && (
                                        <button 
                                            onClick={retryLastMessage}
                                            className="mt-2 text-xs bg-blue-900 text-chalk px-3 py-1 rounded hover:bg-blue-800 transition-colors font-chalk"
                                        >
                                            Retry
                                        </button>
                                    )}
                                </div>
                                
                                {message.role === 'user' && (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-900 text-chalk ml-3 flex-shrink-0">
                                        👨‍🎓
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Loading Indicator */}
                        {loading && (
                            <div className="flex items-start">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-700 text-chalk mr-3">
                                    👨‍🏫
                                </div>
                                <div className="bg-transparent p-4 rounded-lg rounded-tl-none flex items-center space-x-2 min-w-[60px] border-l-4 border-l-yellow-600">
                                    <div className="w-2 h-2 rounded-full bg-chalk animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-chalk animate-pulse delay-150"></div>
                                    <div className="w-2 h-2 rounded-full bg-chalk animate-pulse delay-300"></div>
                                </div>
                            </div>
                        )}
                        
                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                
                {/* Message Input */}
                <div className="border-t border-chalk-dim bg-sidebar-dark p-4 w-full">
                    <div className="max-w-5xl mx-auto">
                        <form onSubmit={handleSendMessage} className="flex">
                            <div className="flex-1 border border-chalk-dim rounded-l-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-600 focus-within:border-yellow-600 chalk-input-container">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask your question about UPSC exam preparation..."
                                    className="w-full p-3 resize-none outline-none min-h-[60px] bg-dark-green text-chalk placeholder-chalk-dim font-chalk"
                                    disabled={loading}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-yellow-800 hover:bg-yellow-700 text-chalk px-6 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-chalk border border-chalk-dim"
                            >
                                {loading ? 'Sending...' : 'Ask'}
                            </button>
                        </form>
                        
                        {/* API status indicator */}
                        {errorState && errorState.isQuotaError && (
                            <div className="mt-2 text-xs text-yellow-500 flex items-center font-chalk">
                                <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                                AI service at capacity - responses may be delayed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface; 