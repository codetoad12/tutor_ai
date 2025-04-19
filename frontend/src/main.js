// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.querySelector('input[type="text"]');
const sendButton = document.querySelector('button:last-child');
const tutorAvatar = document.getElementById('tutor-avatar');

// Mock data for demonstration
const mockResponses = [
    "That's a great question! Let me explain...",
    "I understand your doubt. Here's what you need to know...",
    "Let me break this down for you...",
    "This is an important concept. Here's the explanation..."
];

// Initialize Lottie animation for tutor avatar
let tutorAnimation;
lottie.loadAnimation({
    container: tutorAvatar,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'https://assets2.lottiefiles.com/packages/lf20_xyadoh9h.json' // Replace with your tutor animation
});

// Function to create a message element
function createMessageElement(content, isStudent = false, subject = 'General') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start space-x-3 ${isStudent ? 'justify-end' : ''} message-animation`;
    
    const avatar = isStudent ? '✋' : '👨‍🏫';
    const bgColor = isStudent ? 'bg-student-light' : 'bg-tutor-light';
    const textColor = isStudent ? 'text-student-dark' : 'text-tutor-dark';
    
    messageDiv.innerHTML = `
        ${!isStudent ? `
            <div class="flex-shrink-0">
                <div class="w-8 h-8 ${bgColor} rounded-full flex items-center justify-center">
                    ${avatar}
                </div>
            </div>
        ` : ''}
        <div class="flex-1 ${isStudent ? 'text-right' : ''}">
            <div class="${bgColor} rounded-lg p-4 max-w-[80%] ${isStudent ? 'ml-auto' : ''}">
                <div class="text-sm ${textColor} font-medium mb-1">${subject}</div>
                <p class="text-chalkboard">${content}</p>
            </div>
        </div>
        ${isStudent ? `
            <div class="flex-shrink-0">
                <div class="w-8 h-8 ${bgColor} rounded-full flex items-center justify-center">
                    ${avatar}
                </div>
            </div>
        ` : ''}
    `;
    
    return messageDiv;
}

// Function to show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex items-start space-x-3 message-animation';
    typingDiv.innerHTML = `
        <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-tutor-light rounded-full flex items-center justify-center">
                👨‍🏫
            </div>
        </div>
        <div class="flex-1">
            <div class="bg-tutor-light rounded-lg p-4 max-w-[80%]">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Function to handle sending messages
function handleSendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;

    // Add student message
    const studentMessage = createMessageElement(content, true, 'Current Affairs');
    chatMessages.appendChild(studentMessage);
    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Simulate AI response after delay
    setTimeout(() => {
        typingIndicator.remove();
        const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        const tutorMessage = createMessageElement(response, false, 'History');
        chatMessages.appendChild(tutorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
}

// Event Listeners
sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
}); 