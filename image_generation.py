import os
import requests
from datetime import datetime

DEEPAI_API_KEY = os.environ.get('DEEPAI_API_KEY')
DEEPAI_API_URL = 'https://api.deepai.org/api/text2img'

def generate_image(prompt: str) -> dict:
    """
    Generate an image using DeepAI's text2img API
    Returns a dictionary with 'url' or 'error' key
    """
    headers = {'api-key': DEEPAI_API_KEY}
    data = {'text': prompt}
    
    try:
        response = requests.post(DEEPAI_API_URL, headers=headers, data=data)
        response.raise_for_status()
        result = response.json()
        return {'url': result.get('output_url')}
    except requests.exceptions.RequestException as e:
        return {'error': str(e)}
