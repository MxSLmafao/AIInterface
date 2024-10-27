import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from chat_request import send_openai_request
from image_generation import generate_image

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.form.get('message')
    model = request.form.get('model', 'gpt-3.5-turbo')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        ai_response = send_openai_request(user_message, model)
        return jsonify({'response': ai_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-image', methods=['POST'])
def generate_image_route():
    prompt = request.form.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    # Initialize or get current date and count from session
    today = datetime.now().strftime('%Y-%m-%d')
    if 'image_gen_date' not in session or session['image_gen_date'] != today:
        session['image_gen_date'] = today
        session['image_gen_count'] = 0

    # Check daily limit
    if session['image_gen_count'] >= 5:
        return jsonify({'error': 'Daily limit reached (5 images). Please try again tomorrow.'}), 429

    # Generate image
    result = generate_image(prompt)
    if 'error' in result:
        return jsonify({'error': result['error']}), 500

    # Increment counter on success
    session['image_gen_count'] += 1
    return jsonify({
        'url': result['url'],
        'remaining': 5 - session['image_gen_count']
    })
