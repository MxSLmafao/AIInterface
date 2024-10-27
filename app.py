import os
from flask import Flask, render_template, request, jsonify
from chat_request import send_openai_request

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.form.get('message')
    model = request.form.get('model', 'gpt-4')  # Default to gpt-4 if not specified
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        ai_response = send_openai_request(user_message, model)
        return jsonify({'response': ai_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
