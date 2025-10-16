// Chat application JavaScript
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const imageInput = document.getElementById('imageInput');
const attachButton = document.getElementById('attachButton');
const imagePreview = document.getElementById('imagePreview');
const clearChatButton = document.getElementById('clearChatButton');

// Store conversation history
let conversationHistory = [];
let activeScenario = '';
let pendingFile = null; // holds selected or dropped file until user presses Send
let pendingImageDataUrl = ''; // cached Data URL for preview and sending

// Preview helpers and utilities
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function renderPreview() {
    if (!pendingFile) {
        clearPreview();
        return;
    }
    try {
        pendingImageDataUrl = await readFileAsDataURL(pendingFile);
        if (imagePreview) {
            imagePreview.style.display = 'flex';
            imagePreview.innerHTML = `
                <div class="thumb"><img src="${pendingImageDataUrl}" alt="preview"></div>
                <button id="clearImageButton" class="remove-btn" title="Remove image">Remove</button>
            `;
            const clearBtn = document.getElementById('clearImageButton');
            if (clearBtn) clearBtn.onclick = clearPreview;
        }
    } catch (e) {
        console.error('Failed to read image', e);
        clearPreview();
    }
}

function clearPreview() {
    pendingFile = null;
    pendingImageDataUrl = '';
    if (imageInput) imageInput.value = '';
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.innerHTML = '';
    }
}

function addImageMessage(dataUrl, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'HS';
    const content = document.createElement('div');
    content.className = 'message-content';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'uploaded image';
    img.style.maxWidth = '260px';
    img.style.borderRadius = '12px';
    img.style.display = 'block';
    img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    content.appendChild(img);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

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

    // Attach button opens hidden file input
    if (attachButton) {
        attachButton.addEventListener('click', () => {
            if (imageInput) imageInput.click();
        });
    }

    // When a file is chosen, store and show preview (no auto-send)
    if (imageInput) {
        imageInput.addEventListener('change', () => {
            if (imageInput.files && imageInput.files[0]) {
                pendingFile = imageInput.files[0];
                renderPreview();
            }
        });
    }

    // Drag & drop on the whole chat container
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        ['dragenter', 'dragover'].forEach(evt => {
            chatContainer.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                chatContainer.classList.add('drag-over');
            });
        });
        ['dragleave', 'drop'].forEach(evt => {
            chatContainer.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                chatContainer.classList.remove('drag-over');
            });
        });
        chatContainer.addEventListener('drop', (e) => {
            const files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
            if (files && files.length) {
                // pick first image file
                const file = Array.from(files).find(f => f.type && f.type.startsWith('image/')) || files[0];
                if (file) {
                    pendingFile = file;
                    renderPreview();
                }
            }
        });
    }

    // Clear chat button
    if (clearChatButton) {
        clearChatButton.addEventListener('click', clearChat);
    }
});

// Send message function
async function sendMessage() {
    const message = messageInput.value.trim();
    const file = pendingFile || (imageInput && imageInput.files ? imageInput.files[0] : null);
    let imageDataUrl = pendingImageDataUrl || '';
    
    if (!message && !file && !pendingImageDataUrl) return;
    
    if (file && !imageDataUrl) {
        try {
            imageDataUrl = await readFileAsDataURL(file);
            // Cache in case of retry
            pendingImageDataUrl = imageDataUrl;
        } catch (e) {
            console.error('Failed to read image', e);
            // If reading fails, do not send
            return;
        }
    }
    
    // Add user message to UI
    if (message) {
        addMessage(message, 'user');
    }
    if (imageDataUrl) addImageMessage(imageDataUrl, 'user');
    
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
                image: imageDataUrl,
                history: conversationHistory,
                active_scenario: activeScenario
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
        if (message) {
            conversationHistory.push({
                role: 'user',
                content: message
            });
        }
        conversationHistory.push({
            role: 'assistant',
            content: data.response
        });
        
        // If backend activated a scenario this turn, remember it
        if (data && data.data && data.data.active_scenario) {
            activeScenario = data.data.active_scenario;
        }

        // Handle different response types
        if (data.type === 'catalogue') {
            addCatalogueMessage(data.response, data.data.programmes);
        } else if (data.type === 'embed') {
            addEmbedMessage(data.response, data.data.url, data.data.platform);
        } else if (data.type === 'scenario') {
            addScenarioMessage(data.response, data.data.scenario);
            // remember active scenario for subsequent turns
            if (data.data && data.data.scenario && data.data.scenario.name) {
                activeScenario = data.data.scenario.name;
            }
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
        clearPreview();
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

function addScenarioMessage(text, scenario) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'HS';
    const content = document.createElement('div');
    content.className = 'message-content';
    const titleBubble = document.createElement('div');
    titleBubble.className = 'message-bubble';
    titleBubble.textContent = text;
    const infoBubble = document.createElement('div');
    infoBubble.className = 'message-bubble';
    infoBubble.textContent = `Scenario: ${scenario.title} (name: ${scenario.name})`;
    content.appendChild(titleBubble);
    content.appendChild(infoBubble);
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
    bubble.innerHTML = '<span class="typing-text">HS is typing</span><div class="loading-dots"><span></span><span></span><span></span></div>';
    
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
        
        // Make card clickable - open the programme URL in new tab
        if (prog.url) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                window.open(prog.url, '_blank');
            });
        }
        
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

// Clear chat function
function clearChat() {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to clear the conversation? This cannot be undone.');
    
    if (!confirmed) {
        return;
    }
    
    // Clear conversation history
    conversationHistory = [];
    activeScenario = '';
    
    // Clear the chat messages UI
    chatMessages.innerHTML = '';
    
    // Add welcome message back
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message assistant-message';
    welcomeMessage.innerHTML = `
        <div class="message-avatar">HS</div>
        <div class="message-content">
            <div class="message-bubble">
                Welcome to Harbour.Space! I'm your HS assistant. Ask me about programmes, admissions, scholarships, or campus life.
            </div>
        </div>
    `;
    chatMessages.appendChild(welcomeMessage);
    
    // Clear any pending image
    clearPreview();
    
    // Focus on input
    messageInput.focus();
}
