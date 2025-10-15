"""
Harbour.Space Chatbot - Python Flask Backend
A simple chatbot for Harbour.Space University using OpenAI's GPT API
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
from datetime import datetime
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for API requests

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# System prompt for the chatbot
SYSTEM_PROMPT = """You are a helpful assistant for Harbour.Space University in Barcelona. 
You help prospective students learn about programmes, admissions, scholarships, and campus life.
Be friendly, concise, and informative. When relevant, suggest they explore the programme catalogue by typing "catalogue"."""

# Fallback responses for common questions when rate limited
FALLBACK_RESPONSES = {
    'programmes': "Harbour.Space offers Master's degrees in Computer Science, Data Science, Cyber Security, and Digital Marketing. Type 'catalogue' to see all programmes!",
    'apply': "To apply to Harbour.Space, visit our admissions page. You'll need: academic transcripts, CV, motivation letter, and English proficiency proof. Application deadlines vary by programme.",
    'location': "Harbour.Space University is located in Barcelona, Spain - one of Europe's most vibrant tech hubs!",
    'scholarships': "We offer various scholarships including merit-based awards and industry partnerships. Contact our admissions team for details.",
    'default': "I'm currently experiencing high traffic. Type 'catalogue' to see our programmes, or try asking about: programmes, admissions, location, or scholarships."
}

# Programme catalogue data
PROGRAMMES = [
    {
        'id': 'prog1',
        'title': 'Computer Science',
        'subtitle': "Master's Degree",
        'description': 'Build cutting-edge software and systems with industry leaders',
        'image': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
    },
    {
        'id': 'prog2',
        'title': 'Data Science',
        'subtitle': "Master's Degree",
        'description': 'Master AI, machine learning, and big data analytics',
        'image': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    },
    {
        'id': 'prog3',
        'title': 'Cyber Security',
        'subtitle': "Master's Degree",
        'description': 'Protect digital infrastructure and combat cyber threats',
        'image': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
    },
    {
        'id': 'prog4',
        'title': 'Digital Marketing',
        'subtitle': "Master's Degree",
        'description': 'Drive growth through data-driven marketing strategies',
        'image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    },
]


@app.route('/')
def index():
    """Render the main chatbot page"""
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chat messages and return responses
    
    Request JSON:
    {
        "message": "user message",
        "history": [{"role": "user/assistant", "content": "..."}]
    }
    
    Response JSON:
    {
        "response": "assistant response",
        "type": "text|catalogue|embed",
        "data": {...}  # Optional, for catalogue or embed types
    }
    """
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        conversation_history = data.get('history', [])
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Check for "catalogue" keyword
        if user_message.lower() in ['catalogue', 'catalog']:
            return jsonify({
                'response': 'Here are our available programmes:',
                'type': 'catalogue',
                'data': {'programmes': PROGRAMMES}
            })
        
        # Check for embeddable URLs (YouTube, Vimeo, Maps)
        if 'youtube.com' in user_message or 'youtu.be' in user_message:
            return jsonify({
                'response': "Here's your YouTube video:",
                'type': 'embed',
                'data': {'url': user_message, 'platform': 'youtube'}
            })
        elif 'vimeo.com' in user_message:
            return jsonify({
                'response': "Here's your Vimeo video:",
                'type': 'embed',
                'data': {'url': user_message, 'platform': 'vimeo'}
            })
        elif 'google.com/maps' in user_message or 'goo.gl/maps' in user_message:
            return jsonify({
                'response': "Here's your Google Maps location:",
                'type': 'embed',
                'data': {'url': user_message, 'platform': 'maps'}
            })
        
        # Use OpenAI ChatGPT for general responses
        if not openai.api_key:
            return jsonify({
                'response': 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.',
                'type': 'text'
            })
        
        # Build messages for OpenAI
        messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
        messages.extend(conversation_history)
        messages.append({'role': 'user', 'content': user_message})
        
        # Call OpenAI API with retry logic
        max_retries = 2
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                response = openai.ChatCompletion.create(
                    model='gpt-3.5-turbo',  # Better rate limits than gpt-4o-mini
                    messages=messages,
                    temperature=0.7,
                    max_tokens=300
                )
                break
            except openai.error.RateLimitError:
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    # Use fallback response
                    fallback_msg = get_fallback_response(user_message)
                    return jsonify({
                        'response': fallback_msg,
                        'type': 'text'
                    })
            except Exception as e:
                raise e
        
        assistant_message = response.choices[0].message.content
        
        return jsonify({
            'response': assistant_message,
            'type': 'text'
        })
        
    except openai.error.AuthenticationError:
        return jsonify({
            'error': 'Invalid OpenAI API key. Please check your configuration.',
            'response': 'Sorry, there was an authentication error. Please contact support.',
            'type': 'text'
        }), 401
    except openai.error.RateLimitError:
        fallback_msg = get_fallback_response(data.get('message', ''))
        return jsonify({
            'response': fallback_msg + '\n\n⏳ (Rate limit - please wait 20 seconds between messages)',
            'type': 'text'
        })
    except Exception as e:
        app.logger.error(f'Chat error: {str(e)}')
        return jsonify({
            'error': str(e),
            'response': 'Sorry, I encountered an error. Please try again.',
            'type': 'text'
        }), 500


def get_fallback_response(message):
    """Get a fallback response when OpenAI is rate limited"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['programme', 'program', 'course', 'study', 'degree']):
        return FALLBACK_RESPONSES['programmes']
    elif any(word in message_lower for word in ['apply', 'application', 'admission', 'enroll']):
        return FALLBACK_RESPONSES['apply']
    elif any(word in message_lower for word in ['where', 'location', 'barcelona', 'campus']):
        return FALLBACK_RESPONSES['location']
    elif any(word in message_lower for word in ['scholarship', 'funding', 'financial', 'tuition']):
        return FALLBACK_RESPONSES['scholarships']
    else:
        return FALLBACK_RESPONSES['default']


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': bool(openai.api_key)
    })


if __name__ == '__main__':
    # Check if OpenAI API key is set
    if not openai.api_key:
        print('⚠️  WARNING: OPENAI_API_KEY not found in environment variables')
        print('   Set it in .env file or the chatbot will use fallback responses')
    else:
        print('✅ OpenAI API key configured')
    
    # Run the Flask app
    print('🚀 Starting Harbour.Space Chatbot...')
    print('📍 Open http://localhost:8080 in your browser')
    app.run(debug=True, host='0.0.0.0', port=8080)
