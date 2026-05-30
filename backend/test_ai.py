from app.services.ai import core
import asyncio

def test_questions():
    print("Testing generate_questions fallback cascade...")
    # This should trigger Gemini or cascade down to local fallback
    questions = core.generate_questions(role="Frontend Developer", type="Technical", difficulty="Hard", count=2)
    print("Result:")
    print(questions)

if __name__ == "__main__":
    test_questions()
