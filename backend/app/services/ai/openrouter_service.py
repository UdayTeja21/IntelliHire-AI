import requests
from app.core.config import settings

def generate_openrouter(prompt: str) -> str:
    """
    Calls OpenRouter API using standard requests.
    Raises Exception if API key is missing or call fails.
    """
    if not getattr(settings, "OPENROUTER_API_KEY", None):
        raise ValueError("OPENROUTER_API_KEY is not set.")
        
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "meta-llama/llama-3-8b-instruct:free",
        "messages": [
            {"role": "system", "content": "You are an elite technical recruiter and AI engine. You strictly output valid JSON without markdown wrapping."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    
    data = response.json()
    return data["choices"][0]["message"]["content"]
