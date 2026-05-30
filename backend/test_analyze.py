from app.services.ai import core
import json

def test():
    text = "John Doe. Experienced frontend developer with React, Node.js, and CSS."
    role = "Frontend Developer"
    res = core.analyze_resume(text, role)
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    test()
