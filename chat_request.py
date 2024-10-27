import os
from openai import OpenAI

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def send_openai_request(prompt: str, model: str = "gpt-3.5-turbo") -> str:
    # Validate model selection
    if model not in ["gpt-3.5-turbo", "gpt-4"]:
        model = "gpt-3.5-turbo"  # Default to gpt-3.5-turbo if invalid model is provided
    
    response = openai_client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )
    content = response.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned an empty response.")
    return content
