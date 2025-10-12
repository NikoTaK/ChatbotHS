from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Simple responses for the chatbot
responses = {
    "hello": ["Hello!", "Hi there!", "Greetings!"],
    "how are you": ["I'm just a bot, but I'm doing great!", "I'm functioning well, thank you!"],
    "bye": ["Goodbye!", "See you later!", "Have a great day!"],
    "default": ["I'm not sure how to respond to that.", "Could you rephrase that?", "Interesting, tell me more."]
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').lower()
    
    # Simple response logic
    response = responses["default"]
    for key in responses:
        if key in user_message and key != "default":
            response = responses[key]
            break
    
    return jsonify({
        'response': random.choice(response)
    })

if __name__ == '__main__':
    app.run(debug=True)
