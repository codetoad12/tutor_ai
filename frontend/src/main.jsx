import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize chat functionality only when on the chat route
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/chat')) {
        const messageInput = document.querySelector('.message-input');
        const sendButton = document.querySelector('.send-button');
        const chatMessages = document.querySelector('.chat-messages');

        if (messageInput && sendButton && chatMessages) {
            const handleSendMessage = async () => {
                const message = messageInput.value.trim();
                if (!message) return;

                // Add user message to chat
                const userMessageDiv = document.createElement('div');
                userMessageDiv.className = 'flex justify-end mb-4';
                userMessageDiv.innerHTML = `
                    <div class="max-w-[70%] bg-blue-600 text-white rounded-lg p-4">
                        ${message}
                    </div>
                `;
                chatMessages.appendChild(userMessageDiv);

                // Clear input
                messageInput.value = '';

                try {
                    // Send message to backend
                    const response = await fetch('/api/chat/messages/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            content: message,
                            role: 'user'
                        })
                    });

                    const data = await response.json();

                    // Add assistant message to chat
                    const assistantMessageDiv = document.createElement('div');
                    assistantMessageDiv.className = 'flex justify-start mb-4';
                    assistantMessageDiv.innerHTML = `
                        <div class="max-w-[70%] bg-white text-gray-800 rounded-lg p-4 shadow">
                            ${data.content}
                        </div>
                    `;
                    chatMessages.appendChild(assistantMessageDiv);

                    // Scroll to bottom
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            };

            // Event listeners
            sendButton.addEventListener('click', handleSendMessage);
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSendMessage();
                }
            });
        }
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 