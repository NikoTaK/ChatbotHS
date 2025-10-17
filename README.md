# Harbour.Space Chatbot - Python Version

A simple chatbot built with Python Flask and OpenAI's GPT API for Harbour.Space University.

## 🎯 Features

- **ChatGPT Integration**: Intelligent responses using OpenAI's API(Nikita)
- **Always-on Site Search**: Tries to find info on harbour.space for any text request; if a page is used, appends a single `Source: <url>` at the end(Slava)
- **Targeted Fallbacks**: Admissions, Scholarships, Bachelors/Programmes pages are tried when search is weak(Slava)
- **Image Messages**: Attach image, inline preview auto-clears after sending(Slava)
- **Keyword Routing**: Type `catalogue` to see programmes(Nikita)
- **URL Embedding**: Paste YouTube/Vimeo links to embed videos(Nikita)
- **Structured Logging**: Clear logs for search/fetch/reader and model calls(Slava)
- **Clean UI**: Modern, responsive design with Harbour.Space branding(Nikita, Slava)
- **Conversation History**: Maintains context across messages(Nikita)

## 📁 Project Structure

```
ChatbotHS/
├── hs-embed-chat/
│   └── python-chatbot/
│       ├── app.py                 # Flask backend (main application)
│       ├── requirements.txt       # Python dependencies
│       ├── templates/
│       │   └── index.html         # Main HTML page
│       └── static/
│           ├── css/
│           │   └── style.css      # Styling
│           └── js/
│               └── chat.js        # Frontend JavaScript
└── README.md
```

## 🚀 Quick Start

### 1. Install Python

Make sure you have Python 3.8+ installed:
```bash
python3 --version
```

### 2. Create Virtual Environment

```bash
# Navigate to the backend directory
cd hs-embed-chat/python-chatbot

# Create virtual environment
python3 -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure API Key

Create a `.env` file in `hs-embed-chat/python-chatbot/` with your OpenAI key.

```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```
Get your key from: https://platform.openai.com/api-keys

Your `.env` file should look like:
```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 5. Run the Application

```bash
python app.py
```

The chatbot will start at: **http://localhost:8080**

## 🧪 Testing

Try these commands in the chatbot:

1. **ChatGPT Responses:**
   - "What programmes do you offer?"
   - "How do I apply to Harbour.Space?"
   - "Tell me about scholarships"

2. **Keyword Routing:**
   - Type: `catalogue` → Shows programme cards

3. **URL Embedding:**
   - Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → Embeds video

## 🌐 Web Retrieval Behavior

- **Always tries site search** for any text message, prioritizing `harbour.space`.
- If a page is confidently selected, its text is used to answer and the reply ends with a single `Source: <url>`.
- If search fails or the page text is too short, the bot generates a general answer without a source link.
- You can still force search with prefixes: `web:`, `find:`, `lookup:`, `search:`, `найди:`.

## 📚 Code Explanation (For Learning)

### Backend (app.py)

**Key Python Concepts:**
- **Flask Framework**: Web framework for building APIs
- **Decorators**: `@app.route()` defines URL endpoints
- **Error Handling**: `try/except` blocks for robust code
- **Environment Variables**: `os.getenv()` for secure configuration
- **JSON**: `jsonify()` for API responses

**Main Functions:**
```python
@app.route('/api/chat', methods=['POST'])
def chat():
    # 1. Get user message from request
    # 2. Check for keywords (catalogue, URLs)
    # 3. Call OpenAI API
    # 4. Return response as JSON
```

### Frontend (chat.js)

**Key JavaScript Concepts:**
- **Async/Await**: Modern asynchronous programming
- **Fetch API**: Making HTTP requests to backend
- **DOM Manipulation**: Creating and updating HTML elements
- **Event Listeners**: Handling user interactions

## 🔧 API Endpoints

### POST /api/chat
Send a message and get a response.

**Request:**
```json
{
  "message": "What programmes do you offer?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ]
}
```

**Response:**
```json
{
  "response": "We offer programmes in Computer Science, Data Science...",
  "type": "text"
}
```

### GET /api/health
Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "openai_configured": true
}
```

## 💰 Cost Information

**OpenAI Pricing (gpt-4o-mini):**
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens
- A typical conversation costs less than $0.01

Monitor usage at: https://platform.openai.com/usage

## 🔒 Security Best Practices

✅ **DO:**
- Keep API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables
- Validate user input

❌ **DON'T:**
- Commit API keys to Git
- Share your `.env` file
- Expose keys in client code

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"
```bash
# Make sure virtual environment is activated
source venv/bin/activate
# Reinstall dependencies
pip install -r requirements.txt
```

### "OpenAI API key not configured"
- Check that `.env` file exists
- Verify API key is correct (starts with `sk-`)
- Make sure `.env` is in the same directory as `app.py` (i.e. `hs-embed-chat/python-chatbot/`)

### Logs and diagnostics
- The server prints helpful lines:
  - `[search] ddg/bing ...`, `[search] using seed urls ...`
  - `[fetch] status=...` and `[fetch] reader status=...` for readability proxy
  - `[rid] web doc chosen ... url=...` when a page is used
- If a page is too short you will see: `[web doc too short -> skip web mode ...]`

### "401 Authentication Error"
- Your API key is invalid or expired
- Get a new key from https://platform.openai.com/api-keys

### "429 Rate Limit Error"
- You've exceeded your rate limit
- Wait a few minutes or upgrade your OpenAI plan

## 📖 Learning Resources

**Python:**
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Python Official Tutorial](https://docs.python.org/3/tutorial/)

**OpenAI:**
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ChatGPT Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)

**Web Development:**
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)

## 🚀 Next Steps

1. **Add More Features:**
   - User authentication
   - Save conversation history to database
   - Add more programme information
   - Implement rate limiting

2. **Deploy to Production:**
   - Use Gunicorn for production server
   - Deploy to Heroku, AWS, or DigitalOcean
   - Add HTTPS with SSL certificate
   - Set up monitoring and logging

3. **Improve UI:**
   - Add dark mode
   - Make it mobile-responsive
   - Add typing indicators
   - Implement message reactions

## 📝 Assignment Ideas

For your Python refresher course:

1. **Beginner:**
   - Add a new keyword command (e.g., "contact")
   - Change the color scheme
   - Add more programmes to the catalogue

2. **Intermediate:**
   - Implement conversation history saving (JSON file)
   - Add a feedback system (thumbs up/down)
   - Create a simple admin panel

3. **Advanced:**
   - Add user authentication with sessions
   - Implement a database (SQLite/PostgreSQL)
   - Add streaming responses (real-time typing)
   - Create unit tests with pytest

## 📄 License

This project is for educational purposes.

## 🤝 Support

For questions or issues, please contact your course instructor.

---

**Happy Coding! 🐍**
