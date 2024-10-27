import os
from flask import Flask, render_template, request, jsonify, session
from chat_request import send_openai_request

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"

@app.before_request
def before_request():
    # Initialize counter if not exists
    if 'gpt4o_count' not in session:
        session['gpt4o_count'] = 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.form.get('message')
    model = request.form.get('model', 'gpt-3.5-turbo')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    if model == 'gpt-4o':
        # Check if limit reached
        if session.get('gpt4o_count', 0) >= 5:
            return jsonify({
                'error': 'Daily GPT-4O limit reached (5/5 uses). Please use GPT-3.5-turbo or try again tomorrow.'
            }), 429
        session['gpt4o_count'] = session.get('gpt4o_count', 0) + 1
    
    try:
        ai_response = send_openai_request(user_message, model)
        return jsonify({'response': ai_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/remaining-gpt4o', methods=['GET'])
def remaining_gpt4o():
    used = session.get('gpt4o_count', 0)
    remaining = max(0, 5 - used)
    return jsonify({'remaining': remaining, 'used': used})
