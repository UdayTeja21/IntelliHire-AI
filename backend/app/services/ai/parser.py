import json
import re

def extract_json_from_text(text: str) -> dict | list | None:
    """
    Extremely robust JSON extractor.
    Strips markdown code blocks, handles trailing commas, and aggressively attempts parsing.
    """
    if not text:
        return None
        
    # 1. Clean markdown formatting
    clean_text = re.sub(r"```[a-zA-Z]*", "", text)
    clean_text = re.sub(r"```", "", clean_text).strip()
    
    # 2. Extract first matching JSON block if surrounded by non-json text
    match = re.search(r"(\[.*\]|\{.*\})", clean_text, re.DOTALL)
    if match:
        clean_text = match.group(1)
        
    # 3. Handle trailing commas (common LLM mistake)
    clean_text = re.sub(r',\s*([\]}])', r'\1', clean_text)
    
    try:
        return json.loads(clean_text)
    except Exception as e:
        print(f"[Parser] Standard parse failed. Trying aggressive cleanup. Error: {e}")
        # 4. Aggressive cleanup for unescaped newlines within strings
        try:
            # A very simplistic attempt to escape unescaped newlines in values
            import ast
            # Fallback to ast literal_eval if it happens to be valid python dict format (LLMs do this)
            return ast.literal_eval(clean_text)
        except Exception as e2:
            print(f"[Parser] Aggressive parse failed. Error: {e2}")
            return None
