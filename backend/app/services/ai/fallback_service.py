import random

def get_dynamic_fallback_questions(role: str, type: str, difficulty: str, count: int = 5) -> list:
    """
    Intelligent dynamic fallback generator when all LLMs (Gemini, Groq, OpenRouter) fail.
    Completely eliminates the 'Sample Question 1' error.
    """
    role_lower = role.lower()
    
    questions_bank = {
        "frontend": [
            "How does React's Virtual DOM actually work under the hood?",
            "Explain the difference between useMemo and useCallback. When would you use them?",
            "How do you handle state management in a large-scale React application?",
            "Describe the Critical Rendering Path and how to optimize it.",
            "What are CSS modules and styled-components? Compare them with Tailwind.",
            "How do you prevent unnecessary re-renders in React?",
            "Explain Server-Side Rendering (SSR) vs Static Site Generation (SSG) in Next.js."
        ],
        "backend": [
            "Explain the CAP theorem and how it applies to databases you have used.",
            "How do you handle horizontal vs vertical scaling?",
            "Describe the process of indexing in a relational database.",
            "What is the difference between REST and GraphQL? When would you use each?",
            "How would you design a rate limiter for a public API?",
            "Explain dependency injection and its benefits in software design.",
            "How do you ensure idempotency in a distributed system?"
        ],
        "full stack": [
            "How do you securely handle JWT tokens on the frontend and backend?",
            "Describe a time you had to optimize an incredibly slow database query.",
            "How would you design the architecture for a real-time chat application?",
            "Explain CORS and how to properly configure it.",
            "What strategies do you use for caching data across the stack?"
        ],
        "data": [
            "Explain the difference between a Data Warehouse and a Data Lake.",
            "How do you handle missing or corrupted data in a dataset?",
            "Describe the bias-variance tradeoff in machine learning.",
            "Write a complex SQL query to find the top 3 highest-paid employees in every department.",
            "Explain A/B testing and how to determine statistical significance."
        ],
        "ai": [
            "Explain the attention mechanism in Transformer models.",
            "How do you handle catastrophic forgetting in neural networks?",
            "Describe techniques for reducing hallucination in Large Language Models.",
            "What is Retrieval-Augmented Generation (RAG)? How do you optimize the vector search?",
            "Explain the differences between LoRA and full fine-tuning."
        ],
        "system design": [
            "How would you design a URL shortener like bit.ly?",
            "Design a distributed message queue.",
            "How would you design Netflix's video streaming architecture?",
            "Explain the design of a highly available global load balancer."
        ],
        "hr": [
            "Tell me about a time you had to deal with a difficult coworker.",
            "Why do you want to leave your current position?",
            "Where do you see your career heading in the next 3 to 5 years?",
            "Describe a situation where you had to quickly adapt to a massive change in requirements.",
            "What is your greatest professional achievement so far?",
            "Tell me about a time you failed and what you learned from it."
        ]
    }
    
    # Select category
    category = "frontend"
    if "backend" in role_lower: category = "backend"
    elif "full stack" in role_lower or "fullstack" in role_lower: category = "full stack"
    elif "data" in role_lower: category = "data"
    elif "ai " in role_lower or "machine learning" in role_lower or "ml" in role_lower: category = "ai"
    elif "system design" in role_lower or "architecture" in role_lower: category = "system design"
    elif type.lower() == "behavioral" or "hr" in role_lower: category = "hr"
    
    bank = questions_bank.get(category, questions_bank["full stack"])
    random.shuffle(bank)
    
    selected = bank[:min(count, len(bank))]
    
    # If we need more questions, pad with generic technical/behavioral
    if len(selected) < count:
        selected += [f"Can you dive deeper into your experience with {role}?" for _ in range(count - len(selected))]
        
    return [{"question": q, "category": type} for q in selected]

def get_fallback_resume_analysis(resume_text: str, target_role: str) -> dict:
    """
    Intelligently estimates resume scores based on length and presence of role-specific keywords.
    Ensures the dashboard is never empty and never defaults to 0 incorrectly.
    """
    text_length = len(resume_text.split())
    text_lower = resume_text.lower()
    role_lower = target_role.lower()

    # Basic baseline calculation based on length (assuming a decent resume has 300-800 words)
    if text_length < 100:
        base_score = 40
    elif text_length > 1000:
        base_score = 65 # Too long
    else:
        base_score = 75

    # Keyword matching heuristic
    role_keywords = role_lower.split()
    keyword_matches = sum(1 for kw in role_keywords if kw in text_lower)
    keyword_boost = min(15, keyword_matches * 5)

    ats = min(95, base_score + keyword_boost)
    tech = min(95, ats - random.randint(2, 8))
    proj = min(95, ats - random.randint(5, 12))
    comm = min(95, ats + random.randint(-5, 5))
    skill = min(95, ats + keyword_boost - 5)
    structure = min(95, base_score + 10)

    recruiter = int((ats + comm + structure) / 3)
    hiring = int((ats + tech + proj + recruiter) / 4)

    return {
        "atsScore": int(ats),
        "recruiterScore": int(recruiter),
        "technicalStrengthScore": int(tech),
        "projectQualityScore": int(proj),
        "hiringProbability": int(hiring),
        "projectAnalysis": [
            {
                "name": "General Project", "level": "Intermediate", "complexityScore": int(proj), "recruiterValue": int(recruiter), 
                "technologies": ["Various"], "realWorldImpact": "Demonstrated practical skills.", "scalability": "Moderate", 
                "deploymentPractices": "Standard", "strengths": ["Completed successfully"], "optimizedDescription": "A solid project demonstrating core competencies.", "aiIntegration": "No"
            }
        ],
        "skillAnalysis": {
            "skillStrengthScore": int(skill), "marketRelevanceScore": int(skill)+2, "hiringDemandScore": int(skill)+5,
            "technicalSkills": ["Core Skills"], "missingCriticalSkills": ["Advanced specialized skills"], "trendingSkills": ["Cloud", "AI"],
            "topSkillsToAdd": ["System Design", "Cloud Deployment"], "skillGapAnalysis": "Try focusing on modern enterprise architectures."
        },
        "recruiterSimulation": {
            "wouldScheduleInterview": recruiter > 70, "hiringConfidence": "Medium" if recruiter > 70 else "Low", "reasonForDecision": "Based on a heuristic analysis.",
            "technicalImpression": "Adequate", "projectQualityReview": "Standard", "resumeReadabilityReview": "Good",
            "standoutElements": ["Clean format"], "redFlags": []
        },
        "atsEngine": {
            "readabilityScore": int(structure), "keywordDensity": "Good", "atsPassPrediction": "High" if ats > 75 else "Medium",
            "keywordsFound": ["General keywords"], "missingKeywords": ["Role specific terms"], "whyScoreChanged": "Heuristic fallback evaluated the document."
        },
        "jobMatchAnalysis": {
            "matchPercentage": int(ats), "roleCompatibility": "Moderate", "yearsExperienceDetected": "2+",
            "missingRequirements": ["Specific domain knowledge"]
        },
        "sectionAnalysis": {
            "summary": {
                "score": 75, "detected": ["Objective statement"], "strengths": ["Clear intent"], "weaknesses": ["Could be more specific"],
                "suggestions": ["Add metrics to your summary"], "optimizedVersion": "A results-driven professional.",
                "impactfulLines": ["Highly motivated"], "weakLines": ["Looking for a job"]
            },
            "experience": {
                "score": int(ats), "detected": ["Work history"], "strengths": ["Consistent employment"], "weaknesses": ["Lacking quantifiable results"],
                "suggestions": ["Use the STAR method"], "optimizedVersion": "Led a team that increased revenue by 10%.",
                "impactfulLines": ["Managed team"], "weakLines": ["Responsible for duties"]
            }
        },
        "improvementRoadmap": [
            {"priority": "High", "action": "Ensure the document is pure text, remove complex tables.", "impact": "Better ATS visibility", "timeToComplete": "30 mins"}
        ]
    }

def get_fallback_answer_evaluation(question: str, answer: str, role: str) -> dict:
    """
    Intelligently estimates answer quality if all LLMs fail.
    """
    words = answer.split()
    length = len(words)
    
    if length < 10:
        score = 30
        feedback = "Your answer is extremely brief. Try using the STAR method (Situation, Task, Action, Result) to provide more detail."
        strengths = ["Concise"]
        weaknesses = ["Lacks detail", "No concrete examples", "Too brief"]
    elif length > 250:
        score = 65
        feedback = "Your answer is quite long and might be losing focus. Try to be more concise and direct."
        strengths = ["Detailed"]
        weaknesses = ["Rambling", "Could lose interviewer's attention"]
    else:
        score = min(90, 60 + int(length / 5))
        feedback = "Good standard answer. To improve, ensure you are clearly tying your experience back to the specific role requirements."
        strengths = ["Good length", "Covers the basics"]
        weaknesses = ["Could use more specific metrics", "Consider strengthening the 'Result' phase of your answer"]

    # Simple filler word check
    fillers = sum(1 for w in words if w.lower() in ['um', 'uh', 'like', 'you know', 'basically'])
    if fillers > 3:
        score = max(0, score - 10)
        feedback += " Try to reduce the use of filler words like 'um' or 'like'."
        weaknesses.append("High filler word usage")

    return {
        "score": int(score),
        "feedback": feedback,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestedAnswer": "A strong answer would follow the STAR method, clearly stating the context, your specific actions, and the quantifiable results achieved.",
        "confidenceScore": max(0, min(100, score + 10 - (fillers * 5))),
        "communicationMetrics": {
            "fillerWords": fillers,
            "pace": "Moderate",
            "clarity": "Good" if fillers < 2 else "Needs Improvement"
        }
    }
