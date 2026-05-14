import google.generativeai as genai
from app.core.config import settings
import json, re

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def get_model():
    return genai.GenerativeModel('gemini-1.5-pro')

def safe_json(text: str):
    try:
        clean = re.sub(r"```json|```", "", text).strip()
        return json.loads(clean)
    except Exception:
        return {}

def analyze_resume(resume_text: str, target_role: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return _dynamic_fallback_analysis(resume_text, target_role)
    model = get_model()
    prompt = f"""
You are an elite AI recruitment intelligence engine used by FAANG companies. 
Perform a DEEP, INTELLIGENT, LINE-BY-LINE analysis of this resume for the role: {target_role}

Analyze EVERY section, skill, project, keyword, and technology mentioned. Be SPECIFIC, CONTEXTUAL, and RECRUITER-LIKE.

Return ONLY valid JSON in this exact structure:
{{
  "atsScore": <0-100 integer, real score based on actual content>,
  "recruiterScore": <0-100 integer, how impressed a recruiter would be>,
  "hiringProbability": <0-100 integer>,
  "resumeQualityScore": <0-100 integer>,
  "interviewSelectionProbability": <0-100 integer>,
  "overallVerdict": "<2-3 sentence recruiter-style verdict on this resume>",
  "recruiterFirstImpression": "<what a recruiter thinks in the first 6 seconds>",
  
  "sectionAnalysis": {{
    "summary": {{
      "score": <0-100>,
      "detected": "<what was found or 'Not found'>",
      "strengths": ["<specific strength>"],
      "weaknesses": ["<specific weakness>"],
      "suggestions": ["<specific suggestion>"],
      "optimizedVersion": "<AI-rewritten better version>"
    }},
    "skills": {{
      "score": <0-100>,
      "detected": ["<actual skills found in resume>"],
      "strengths": ["<specific strength>"],
      "weaknesses": ["<specific weakness>"],
      "suggestions": ["<specific suggestion>"]
    }},
    "experience": {{
      "score": <0-100>,
      "detected": "<what experience was found>",
      "strengths": ["<specific strength>"],
      "weaknesses": ["<specific weakness>"],
      "suggestions": ["<specific suggestion>"],
      "impactfulLines": ["<lines that are strong>"],
      "weakLines": ["<lines that are generic or weak>"]
    }},
    "projects": {{
      "score": <0-100>,
      "strengths": ["<specific strength>"],
      "weaknesses": ["<specific weakness>"],
      "suggestions": ["<specific suggestion>"]
    }},
    "education": {{
      "score": <0-100>,
      "detected": "<what was found>",
      "strengths": ["<specific strength>"],
      "suggestions": ["<specific suggestion>"]
    }},
    "certifications": {{
      "score": <0-100>,
      "detected": ["<certifications found or empty>"],
      "suggestions": ["<specific relevant certifications to add>"]
    }},
    "achievements": {{
      "score": <0-100>,
      "detected": ["<achievements found>"],
      "suggestions": ["<specific suggestions>"]
    }}
  }},

  "projectAnalysis": [
    {{
      "name": "<project name>",
      "technologies": ["<tech stack detected>"],
      "level": "<Beginner|Intermediate|Advanced|Enterprise>",
      "complexityScore": <0-100>,
      "recruiterValue": <0-100>,
      "realWorldImpact": "<assessment of impact>",
      "scalability": "<assessment>",
      "aiIntegration": "<yes/no + details>",
      "deploymentPractices": "<assessment>",
      "strengths": ["<specific strength>"],
      "improvements": ["<specific improvement>"],
      "optimizedDescription": "<AI-rewritten better project description>"
    }}
  ],

  "skillAnalysis": {{
    "technicalSkills": ["<detected from resume>"],
    "missingCriticalSkills": ["<most important missing skills for {target_role}>"],
    "trendingSkills": ["<in-demand skills for this role in 2024>"],
    "redundantSkills": ["<outdated or irrelevant skills listed>"],
    "skillStrengthScore": <0-100>,
    "marketRelevanceScore": <0-100>,
    "hiringDemandScore": <0-100>,
    "skillGapAnalysis": "<detailed paragraph on skill gaps>",
    "topSkillsToAdd": ["<top 5 skills that would dramatically increase ATS score>"]
  }},

  "atsEngine": {{
    "keywordsFound": ["<ATS keywords detected in resume>"],
    "missingKeywords": ["<critical ATS keywords not in resume>"],
    "formattingIssues": ["<any formatting problems>"],
    "readabilityScore": <0-100>,
    "keywordDensity": "<assessment: too low/optimal/stuffed>",
    "atsPassPrediction": "<Will pass|Might pass|Likely rejected>",
    "whyScoreChanged": "<explanation of what most affects ATS score>",
    "sectionsAffectingATS": ["<section: impact>"]
  }},

  "jobMatchAnalysis": {{
    "matchPercentage": <0-100>,
    "matchedRequirements": ["<requirements the resume satisfies>"],
    "missingRequirements": ["<role requirements not met>"],
    "roleCompatibility": "<Strong|Moderate|Weak>",
    "yearsExperienceDetected": "<detected or unknown>",
    "experienceGap": "<assessment>"
  }},

  "recruiterSimulation": {{
    "technicalImpression": "<recruiter's technical assessment>",
    "projectQualityReview": "<recruiter's view of projects>",
    "resumeReadabilityReview": "<recruiter's readability comment>",
    "hiringConfidence": "<High|Medium|Low>",
    "wouldScheduleInterview": <true|false>,
    "reasonForDecision": "<detailed reason>",
    "standoutElements": ["<what stood out positively>"],
    "redFlags": ["<any red flags>"]
  }},

  "aiImprovements": {{
    "betterSummary": "<complete optimized summary section>",
    "strongerBulletPoints": ["<5 strong action-verb bullet points for this role>"],
    "atsKeywordsToAdd": ["<specific keywords to weave in>"],
    "powerActionVerbs": ["<strong verbs to use>"],
    "formattingTips": ["<specific formatting suggestions>"]
  }},

  "improvementRoadmap": [
    {{
      "priority": "<High|Medium|Low>",
      "action": "<specific action to take>",
      "impact": "<expected impact on ATS/recruiter score>",
      "timeToComplete": "<estimate>"
    }}
  ],

  "learningPath": [
    {{
      "skill": "<skill to learn>",
      "reason": "<why it matters for {target_role}>",
      "resources": ["<specific course or resource>"],
      "priority": "<High|Medium|Low>"
    }}
  ]
}}

Resume to analyze:
---
{resume_text}
---
"""
    try:
        response = model.generate_content(prompt)
        result = safe_json(response.text)
        if not result:
            return _dynamic_fallback_analysis(resume_text, target_role)
        return result
    except Exception as e:
        print(f"Gemini error: {e}")
        return _dynamic_fallback_analysis(resume_text, target_role)


def generate_questions(role: str, type: str, difficulty: str, count: int = 10, resume_context: str = None) -> list:
    if not settings.GEMINI_API_KEY:
        return _generate_dynamic_fallback_questions(role, type, difficulty, count, resume_context)
    
    model = get_model()
    
    if resume_context:
        prompt = f"""You are an elite technical recruiter. Generate {count} {difficulty} {type} interview questions for a {role} position.
Crucially, base these questions deeply on the candidate's actual resume provided below.
Ask about specific projects, technologies, and experiences mentioned in their resume.

Resume:
{resume_context}

Return ONLY a JSON array: [{{"question": "string", "category": "string"}}]"""
    else:
        prompt = f"""Generate {count} {difficulty} {type} interview questions for a {role}.
Return ONLY a JSON array: [{{"question": "string", "category": "string"}}]"""
        
    try:
        response = model.generate_content(prompt)
        result = safe_json(response.text)
        if isinstance(result, list):
            return result
        elif isinstance(result, dict):
            # check if it's wrapped in a key like 'questions'
            for val in result.values():
                if isinstance(val, list):
                    return val
        return [{"question": f"Sample {role} {type} question {i+1}", "category": type} for i in range(count)]
    except Exception:
        return [{"question": f"Sample question {i+1}", "category": type} for i in range(count)]


def evaluate_answer(question: str, answer: str, role: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return _generate_dynamic_fallback_evaluation(question, answer, role)
    model = get_model()
    prompt = f"""Evaluate this {role} interview answer.
Question: {question}
Answer: {answer}
Return ONLY JSON: {{"score": <0-100>, "feedback": "string", "strengths": ["string"], "weaknesses": ["string"], "suggestedAnswer": "string"}}"""
    try:
        response = model.generate_content(prompt)
        return safe_json(response.text)
    except Exception:
        return {"score": 70, "feedback": "Answer evaluated.", "strengths": [], "weaknesses": [], "suggestedAnswer": ""}


ROLES_KEYWORDS = {
    'Software Engineer': ['Python', 'Java', 'Algorithms', 'Data Structures', 'Git', 'Agile', 'SQL', 'Unit Testing', 'CI/CD'],
    'Frontend Developer': ['React', 'TypeScript', 'Tailwind', 'CSS', 'HTML', 'JavaScript', 'Next.js', 'Redux', 'UX'],
    'Backend Developer': ['Node.js', 'Express', 'PostgreSQL', 'Microservices', 'Docker', 'Redis', 'GraphQL', 'API', 'Go'],
    'Full Stack Developer': ['React', 'Node.js', 'Database', 'Auth', 'Deployment', 'System Design', 'JavaScript', 'AWS'],
    'Data Scientist': ['Python', 'Pandas', 'NumPy', 'TensorFlow', 'Scikit-Learn', 'Statistics', 'R', 'SQL', 'Deep Learning'],
    'AI/ML Engineer': ['Neural Networks', 'NLP', 'PyTorch', 'Transformers', 'CV', 'LLMs', 'Model Optimization', 'Python'],
    'DevOps Engineer': ['Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Cloud', 'Monitoring', 'Linux', 'Automation'],
    'Product Manager': ['Roadmap', 'Strategy', 'User Research', 'Agile', 'Scrum', 'Stakeholder', 'Data-driven', 'Product Life Cycle'],
    'UI/UX Designer': ['Figma', 'Prototyping', 'User Flows', 'Design Systems', 'Adobe XD', 'Research', 'Accessibility', 'Wireframes'],
    'Data Analyst': ['SQL', 'Tableau', 'Power BI', 'Excel', 'Data Cleaning', 'Visualization', 'Dashboards', 'Reporting']
}

def _dynamic_fallback_analysis(resume_text: str, role: str) -> dict:
    text_lower = resume_text.lower()
    word_count = len(text_lower.split())
    
    keywords = ROLES_KEYWORDS.get(role, ['Teamwork', 'Communication', 'Problem Solving', 'Leadership'])
    found_keywords = [kw for kw in keywords if kw.lower() in text_lower]
    missing_keywords = [kw for kw in keywords if kw.lower() not in text_lower]
    
    keyword_match_rate = len(found_keywords) / len(keywords) if keywords else 0
    
    # Scoring logic
    base_score = 40
    keyword_score = int(keyword_match_rate * 40)
    length_score = min(20, int(word_count / 15)) # up to 20 points for length
    
    ats_score = base_score + keyword_score + length_score
    recruiter_score = max(0, ats_score - 5)
    
    verdict = f"This resume is tailored for a {role} position."
    if ats_score > 80:
        verdict += " It shows excellent keyword optimization and depth."
    elif ats_score > 60:
        verdict += " It covers the basics but needs more specific technical keywords."
    else:
        verdict += " It is missing critical keywords and seems too brief."
        
    ats_pass = "Will pass" if ats_score > 75 else "Might pass" if ats_score > 60 else "Likely rejected"
    
    return {
        "atsScore": ats_score,
        "recruiterScore": recruiter_score,
        "hiringProbability": max(0, ats_score - 10),
        "resumeQualityScore": ats_score,
        "interviewSelectionProbability": max(0, ats_score - 15),
        "overallVerdict": verdict,
        "recruiterFirstImpression": "Looks strong technically." if ats_score > 70 else "Seems a bit light on specifics.",
        "sectionAnalysis": {
            "summary": {"score": ats_score, "detected": "Present" if "summary" in text_lower or "profile" in text_lower else "Not found", "strengths": ["Length is okay"] if word_count > 100 else [], "weaknesses": ["Too short"] if word_count < 100 else [], "suggestions": ["Add metrics"], "optimizedVersion": f"Results-driven {role}."},
            "skills": {"score": int(keyword_match_rate * 100), "detected": found_keywords, "strengths": ["Good match"] if keyword_match_rate > 0.5 else [], "weaknesses": ["Missing core skills"] if keyword_match_rate < 0.5 else [], "suggestions": missing_keywords[:3]},
            "experience": {"score": length_score * 5, "detected": "Present", "strengths": ["Shows detail"] if length_score > 10 else [], "weaknesses": ["Needs more detail"] if length_score < 10 else [], "suggestions": ["Quantify achievements"], "impactfulLines": [], "weakLines": []},
            "projects": {"score": 70, "strengths": [], "weaknesses": [], "suggestions": ["Add GitHub links"]},
            "education": {"score": 80, "detected": "Present", "strengths": [], "suggestions": []},
            "certifications": {"score": 50, "detected": [], "suggestions": []},
            "achievements": {"score": 50, "detected": [], "suggestions": []}
        },
        "projectAnalysis": [{"name": "Sample Project", "technologies": found_keywords[:2] if found_keywords else [], "level": "Intermediate", "complexityScore": ats_score, "recruiterValue": recruiter_score, "realWorldImpact": "Moderate", "scalability": "Limited", "aiIntegration": "No", "deploymentPractices": "Basic", "strengths": ["Uses core skills"], "improvements": ["Add CI/CD"], "optimizedDescription": f"Built a project using {', '.join(found_keywords[:2]) if found_keywords else 'standard tools'}"}],
        "skillAnalysis": {
            "technicalSkills": found_keywords,
            "missingCriticalSkills": missing_keywords,
            "trendingSkills": [],
            "redundantSkills": [],
            "skillStrengthScore": int(keyword_match_rate * 100),
            "marketRelevanceScore": 75,
            "hiringDemandScore": 80,
            "skillGapAnalysis": f"Missing keywords like {', '.join(missing_keywords[:3])}" if missing_keywords else "All critical keywords found.",
            "topSkillsToAdd": missing_keywords[:5]
        },
        "atsEngine": {
            "keywordsFound": found_keywords,
            "missingKeywords": missing_keywords,
            "formattingIssues": ["Check spacing"] if word_count < 100 else [],
            "readabilityScore": 80,
            "keywordDensity": "Optimal" if keyword_match_rate > 0.5 else "Too low",
            "atsPassPrediction": ats_pass,
            "whyScoreChanged": "Based on keyword matching and length.",
            "sectionsAffectingATS": ["Skills"]
        },
        "jobMatchAnalysis": {
            "matchPercentage": int(keyword_match_rate * 100),
            "matchedRequirements": found_keywords,
            "missingRequirements": missing_keywords,
            "roleCompatibility": "Strong" if keyword_match_rate > 0.7 else "Moderate",
            "yearsExperienceDetected": "Unknown",
            "experienceGap": "Needs verification"
        },
        "recruiterSimulation": {
            "technicalImpression": "Solid foundation" if ats_score > 70 else "Needs more depth",
            "projectQualityReview": "Acceptable",
            "resumeReadabilityReview": "Good",
            "hiringConfidence": "High" if ats_score > 80 else "Medium",
            "wouldScheduleInterview": ats_score > 70,
            "reasonForDecision": "Score meets threshold" if ats_score > 70 else "Score too low",
            "standoutElements": found_keywords[:2] if found_keywords else [],
            "redFlags": [] if ats_score > 60 else ["Low keyword match"]
        },
        "aiImprovements": {
            "betterSummary": f"Dynamic {role} with skills in {', '.join(found_keywords[:3]) if found_keywords else 'various technologies'}.",
            "strongerBulletPoints": ["Developed robust solutions", "Improved performance"],
            "atsKeywordsToAdd": missing_keywords,
            "powerActionVerbs": ["Engineered", "Optimized", "Spearheaded"],
            "formattingTips": ["Use clear headings"]
        },
        "improvementRoadmap": [
            {"priority": "High", "action": f"Add missing keyword: {kw}", "impact": "+5 ATS score", "timeToComplete": "1 hour"} for kw in missing_keywords[:2]
        ],
        "learningPath": [
            {"skill": kw, "reason": "Required for role", "resources": [], "priority": "High"} for kw in missing_keywords[:2]
        ]
    }
import random

def _generate_dynamic_fallback_questions(role: str, type: str, difficulty: str, count: int, resume_context: str) -> list:
    questions = []
    
    # Try to extract some technologies from the resume to make it dynamic
    found_tech = []
    if resume_context:
        text_lower = resume_context.lower()
        keywords = ROLES_KEYWORDS.get(role, [])
        found_tech = [kw for kw in keywords if kw.lower() in text_lower]
        
    tech1 = random.choice(found_tech) if found_tech else "your primary programming language"
    tech2 = random.choice(found_tech) if len(found_tech) > 1 else "the core technologies"
    
    templates = [
        {"q": f"I see you have experience with {tech1}. Can you explain a complex problem you solved using it and how you optimized the solution?", "c": "Technical Depth"},
        {"q": f"In your resume, you mention working with {tech2}. How do you ensure best practices and security when deploying applications with this stack?", "c": "Architecture & Security"},
        {"q": f"For a {difficulty} level {role} position, system design is crucial. Walk me through the architecture of the most challenging project on your resume.", "c": "System Design"},
        {"q": f"Tell me about a time your implementation using {tech1} failed in production or testing. How did you debug and resolve it?", "c": "Behavioral / Debugging"},
        {"q": f"Given your background, if you had to build a scalable microservice architecture for a new feature, how would you incorporate {tech2}?", "c": "Scalability"},
        {"q": f"How do you stay updated with the latest trends in the {role} space, particularly regarding tools like {tech1}?", "c": "Continuous Learning"},
        {"q": f"Describe a situation where you had to disagree with a senior team member regarding the use of {tech2} or similar tech. How did you handle it?", "c": "Behavioral"},
        {"q": f"If we asked you to lead a project from scratch today, how would you structure the initial repository and CI/CD pipelines?", "c": "Project Management"},
        {"q": f"What do you consider your greatest technical achievement on your resume, and what measurable impact did it have on the business?", "c": "Impact & Leadership"},
        {"q": f"Explain the underlying mechanics of how {tech1} manages memory or state, and why that matters for performance.", "c": "Low-level Technical"}
    ]
    
    generic_templates = [
        {"q": f"As a {role}, what is your approach to handling technical debt in a fast-paced agile environment?", "c": "Process"},
        {"q": f"Describe a time you had to learn a completely new technology on the job. How did you approach it?", "c": "Adaptability"},
        {"q": f"What is the most difficult technical concept you've had to explain to a non-technical stakeholder?", "c": "Communication"},
        {"q": f"How do you approach code reviews, both when reviewing others' code and receiving feedback on your own?", "c": "Teamwork"},
        {"q": f"Explain a situation where you had to optimize the performance of a slow application or database query.", "c": "Performance"}
    ]
    
    pool = templates if found_tech else generic_templates + templates
    random.shuffle(pool)
    
    for i in range(min(count, len(pool))):
        questions.append({"question": pool[i]["q"], "category": pool[i]["c"]})
        
    return questions

def _generate_dynamic_fallback_evaluation(question: str, answer: str, role: str) -> dict:
    words = len(answer.split())
    if words < 10:
        return {
            "score": random.randint(30, 50),
            "feedback": "Your answer was too brief. Please elaborate more on your experience.",
            "strengths": ["Concise"],
            "weaknesses": ["Lack of detail", "Too short"],
            "suggestedAnswer": "A good answer should use the STAR method (Situation, Task, Action, Result) to fully explain your approach."
        }
    elif words < 30:
        return {
            "score": random.randint(60, 75),
            "feedback": "You provided a decent overview, but it lacks deep technical specifics.",
            "strengths": ["On topic"],
            "weaknesses": ["Needs more technical depth", "Could provide more real-world examples"],
            "suggestedAnswer": "Try to include specific frameworks or methodologies you used to solve the problem."
        }
    else:
        return {
            "score": random.randint(85, 95),
            "feedback": "Excellent response. You provided great detail and demonstrated strong knowledge.",
            "strengths": ["Detailed", "Comprehensive", "Clear communication"],
            "weaknesses": ["Could be slightly more concise"],
            "suggestedAnswer": "Your answer was great! To make it perfect, briefly summarize the business impact of your technical decisions at the end."
        }
