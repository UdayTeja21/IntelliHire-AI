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
        
    # 3. Trailing commas are handled by the ast.literal_eval fallback safely.
    
    try:
        return json.loads(clean_text)
    except Exception as e:
        print(f"[Parser] Standard parse failed. Trying aggressive cleanup. Error: {e}")
        # 4. Aggressive cleanup for python dict syntax and unescaped newlines
        try:
            import ast
            # Convert JSON boolean/null to Python equivalents for literal_eval
            # Only replace exact words, though a simple string replace is risky, it's a last resort
            py_text = re.sub(r'\btrue\b', 'True', clean_text)
            py_text = re.sub(r'\bfalse\b', 'False', py_text)
            py_text = re.sub(r'\bnull\b', 'None', py_text)
            return ast.literal_eval(py_text)
        except Exception as e2:
            print(f"[Parser] Aggressive parse failed. Error: {e2}")
            return None
