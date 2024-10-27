import os
from openai import OpenAI
from personalities import get_personality

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def send_openai_request(prompt: str, model: str = "gpt-4o", personality: str = "default") -> str:
    # Validate model selection
    if model not in ["gpt-4o", "gpt-3.5-turbo"]:
        model = "gpt-4o"  # Default to gpt-4o if invalid model is provided
    
    # Get personality configuration
    personality_config = get_personality(personality)
    
    response = openai_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": personality_config["system_prompt"]},
            {"role": "user", "content": prompt}
        ]
    )
    content = response.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned an empty response.")
    return content
