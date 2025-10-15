// Chat application JavaScript
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Store conversation history
let conversationHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
    
    // Handle Enter key
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Handle send button click
    sendButton.addEventListener('click', sendMessage);
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });
});

// Send message function
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message to UI
    addMessage(message, 'user');
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button
    sendButton.disabled = true;
    
    // Show loading indicator
    const loadingId = showLoading();
    
    try {
        // Send to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory
            })
        });
        
        const data = await response.json();
        
        // Remove loading indicator
        removeLoading(loadingId);
        
        if (!response.ok) {
            addMessage(data.response || 'Sorry, an error occurred.', 'assistant');
            return;
        }
        
        // Add to conversation history
        conversationHistory.push({
            role: 'user',
            content: message
        });
        conversationHistory.push({
            role: 'assistant',
            content: data.response
        });
        
        // Handle different response types
        if (data.type === 'catalogue') {
            addCatalogueMessage(data.response, data.data.programmes);
        } else if (data.type === 'embed') {
            addEmbedMessage(data.response, data.data.url, data.data.platform);
        } else {
            addMessage(data.response, 'assistant');
        }
        
    } catch (error) {
        removeLoading(loadingId);
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Add message to chat
function addMessage(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'HS';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    content.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Show loading indicator
function showLoading() {
    const loadingId = 'loading-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    messageDiv.id = loadingId;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'HS';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'loading-bubble';
    bubble.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    
    content.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    return loadingId;
}

// Remove loading indicator
function removeLoading(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Add catalogue message
function addCatalogueMessage(title, programmes) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'HS';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const titleBubble = document.createElement('div');
    titleBubble.className = 'message-bubble';
    titleBubble.textContent = title;
    content.appendChild(titleBubble);
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'programme-cards';
    
    programmes.forEach(prog => {
        const card = document.createElement('div');
        card.className = 'programme-card';
        card.innerHTML = `
            <img src="${prog.image}" alt="${prog.title}">
            <div class="programme-card-content">
                <div class="subtitle">${prog.subtitle}</div>
                <h3>${prog.title}</h3>
                <p>${prog.description}</p>
            </div>
        `;
        cardsContainer.appendChild(card);
    });
    
    content.appendChild(cardsContainer);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add embed message
function addEmbedMessage(title, url, platform) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'HS';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const titleBubble = document.createElement('div');
    titleBubble.className = 'message-bubble';
    titleBubble.textContent = title;
    content.appendChild(titleBubble);
    
    const embedContainer = document.createElement('div');
    embedContainer.style.cssText = 'margin-top: 8px; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
    
    let embedHTML = '';
    if (platform === 'youtube') {
        const videoId = extractYouTubeId(url);
        embedHTML = `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (platform === 'vimeo') {
        const videoId = extractVimeoId(url);
        embedHTML = `<iframe width="100%" height="300" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else {
        embedHTML = `<p style="padding: 16px;">Embed preview not available. <a href="${url}" target="_blank">Open link</a></p>`;
    }
    
    embedContainer.innerHTML = embedHTML;
    content.appendChild(embedContainer);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Extract YouTube video ID
function extractYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
}

// Extract Vimeo video ID
function extractVimeoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
}

// Scroll to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
