import google.generativeai as genai
from app.core.config import settings

import time
import logging

logger = logging.getLogger(__name__)

def generate_gemini(prompt: str, max_retries: int = 2) -> str:
    """
    Calls Gemini 2.0 Flash with retry logic and strict timeouts.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set.")
        
    genai.configure(api_key=settings.GEMINI_API_KEY, transport="rest")
    
    # We configure generation config to prevent excessive length and enforce timeout
    # However, timeout is not directly supported in the model config, so we handle it 
    # via the retries and relying on the underlying grpc timeout defaults.
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    for attempt in range(max_retries + 1):
        try:
            # Gemini SDK handles network requests synchronously here
            response = model.generate_content(
                prompt, 
                generation_config={"response_mime_type": "application/json"},
                request_options={"timeout": 60}
            )
            return response.text
        except Exception as e:
            if attempt == max_retries:
                logger.error(f"[Gemini API] Failed after {max_retries + 1} attempts: {str(e)}")
                raise e
            wait_time = 2 ** attempt
            logger.warning(f"[Gemini API] Attempt {attempt + 1} failed. Retrying in {wait_time}s... Error: {str(e)}")
            time.sleep(wait_time)
            
    raise RuntimeError("Gemini generation failed unexpectedly.")
