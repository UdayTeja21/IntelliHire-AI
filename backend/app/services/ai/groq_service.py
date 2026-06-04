import requests
from app.core.config import settings

import time
import logging

logger = logging.getLogger(__name__)

def generate_groq(prompt: str, max_retries: int = 2) -> str:
    """
    Calls Groq API (e.g. Llama-3-70b-8192) using standard requests with retry logic.
    Raises Exception if API key is missing or call fails.
    """
    if not getattr(settings, "GROQ_API_KEY", None):
        raise ValueError("GROQ_API_KEY is not set.")
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are an elite technical recruiter and AI engine. You strictly output valid JSON without markdown wrapping."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }
    
    for attempt in range(max_retries + 1):
        try:
            # Set strict timeout to prevent freezing
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            if attempt == max_retries:
                logger.error(f"[Groq API] Failed after {max_retries + 1} attempts: {str(e)}")
                raise e
            wait_time = 2 ** attempt
            logger.warning(f"[Groq API] Attempt {attempt + 1} failed. Retrying in {wait_time}s... Error: {str(e)}")
            time.sleep(wait_time)
            
    raise RuntimeError("Groq generation failed unexpectedly.")

def transcribe_audio(file_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Sends raw audio to Groq's Whisper Large V3 API for flawless STT.
    """
    if not getattr(settings, "GROQ_API_KEY", None):
        raise ValueError("GROQ_API_KEY is not set.")
        
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}"
    }
    
    files = {
        "file": (filename, file_bytes, "audio/webm")
    }
    data = {
        "model": "whisper-large-v3-turbo",
        "response_format": "json"
    }
    
    try:
        response = requests.post(url, headers=headers, files=files, data=data, timeout=30)
        response.raise_for_status()
        return response.json().get("text", "")
    except Exception as e:
        logger.error(f"[Groq Whisper API] Transcription failed: {str(e)}")
        # Fallback to empty string on failure
        return ""
