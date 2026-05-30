import sys
import json
from app.services.ai.fallback_service import get_fallback_resume_analysis
from app.services.ai.validator import validate_resume_scores
from app.services.ai.gemini_service import generate_gemini

resume = """
John Doe
Frontend Developer

Summary:
Highly motivated frontend developer with 3 years of experience building web applications.

Experience:
- Developed a React application that increased user engagement by 20%.
- Maintained legacy codebase.

Projects:
- Built a real-time chat application using React, Node.js, and Socket.io.
- Developed an e-commerce platform using Next.js and TailwindCSS.

Skills:
React, Node.js, JavaScript, HTML, CSS
"""

role = "Frontend Developer"

print("--- Testing Fallback ---")
res = get_fallback_resume_analysis(resume, role)
val = validate_resume_scores(res)
print("Projects:", len(val.get('projectAnalysis', [])))
if val.get('projectAnalysis'):
    print("Project 1 Name:", val['projectAnalysis'][0]['name'])
print("Sections:", list(val.get('sectionAnalysis', {}).keys()))
print("Roadmap:", val.get('improvementRoadmap', []))

print("\n--- Testing Gemini JSON Mode ---")
prompt = f"Return ONLY valid JSON. {{\"status\": \"ok\", \"projects\": [\"Real-time chat\", \"E-commerce platform\"]}} Resume: {resume}"
try:
    gem_res = generate_gemini(prompt)
    print("Gemini Response:", gem_res)
    parsed = json.loads(gem_res)
    print("Parsed JSON successfully:", parsed)
except Exception as e:
    print("Gemini failed:", e)

