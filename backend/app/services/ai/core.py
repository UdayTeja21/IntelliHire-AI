import traceback
from app.services.ai.gemini_service import generate_gemini
from app.services.ai.groq_service import generate_groq
from app.services.ai.fallback_service import (
    get_dynamic_fallback_questions,
    get_fallback_resume_analysis,
    get_fallback_answer_evaluation
)
from app.services.ai.parser import extract_json_from_text
from app.services.ai.validator import validate_resume_scores
import logging

logger = logging.getLogger(__name__)

def _orchestrate_gemini_fallback(prompt: str) -> str:
    """
    Resume Analysis Fallback: Gemini -> Local Fallback
    """
    try:
        print("[LLM Orchestrator] Attempting Gemini for Resume Analysis...")
        return generate_gemini(prompt, max_retries=1)
    except Exception as e_gemini:
        print(f"[LLM Orchestrator] Gemini failed: {e_gemini}")
        raise RuntimeError("Primary Resume LLM failed.")

def _orchestrate_groq_fallback(prompt: str) -> str:
    """
    Mock Interview Fallback: Groq -> Local Fallback
    """
    try:
        print("[LLM Orchestrator] Attempting Groq for Mock Interview...")
        return generate_groq(prompt, max_retries=1)
    except Exception as e_groq:
        print(f"[LLM Orchestrator] Groq failed: {e_groq}")
        raise RuntimeError("Primary Interview LLM failed.")

def analyze_resume(resume_text: str, target_role: str, experience_level: str = "Fresher (0-1 years)") -> dict:
    prompt = f"""
You are an elite AI recruitment intelligence engine used by FAANG companies. 
Perform a DEEP, INTELLIGENT, LINE-BY-LINE analysis of this resume for the role: {target_role}
The candidate's stated experience level is: {experience_level}. Use this to adjust your scoring and weightages accordingly.

CRITICAL INSTRUCTION: For "projectAnalysis", you MUST extract EVERY SINGLE project found in the resume as a completely separate JSON object. Do not group them.
1. "name": You MUST extract ONLY projects explicitly named and detailed in the provided resume. DO NOT generate, hallucinate, or infer extra projects. DO NOT extract standalone skills, generic terms like "Ai", or "Core Technologies" as projects. If the resume only contains 1 project, your array MUST only contain 1 project. Extract the EXACT project title.
2. "projectWeightage": You MUST calculate this dynamically strictly based on the provided experience level ({experience_level}). For a Fresher, their projects are their primary experience and carry heavy weight. For a Senior, projects might carry less weight. DO NOT just default to 5% for all projects.
3. For each project, provide its specific "technologies" (tech stack) and tailored "suggestions" for improvements. Do NOT hallucinate.
CRITICAL INSTRUCTION: For "skillAnalysis", you MUST analyze the skills extracted directly from the resume and compare them against real-world, current industry demands (the "real view") for the target role. Provide a brutal, realistic gap analysis.

CRITICAL INSTRUCTION: For "recruiterSimulation", act as an elite FAANG hiring manager. Provide a deeply critical "technicalImpression", "projectQualityReview", and list any "redFlags". 

CRITICAL INSTRUCTION: For "improvementRoadmap", provide a highly specific, dynamic, and actionable step-by-step improvement plan based strictly on the candidate's actual resume gaps. Do NOT output generic advice like "ensure document is pure text".

CRITICAL INSTRUCTION: For "sectionAnalysis", you MUST dynamically extract and analyze ALL key sections present in the resume (e.g., summary, experience, education, projects, skills, certifications, achievements). Do not limit it to just summary and experience.Return ONLY valid JSON.
{{
  "atsScore": 85,
  "recruiterScore": 80,
  "technicalStrengthScore": 85,
  "projectQualityScore": 80,
  "hiringProbability": 82,
  "projectAnalysis": [
    {{
      "name": "String (exact project title extracted from resume)", "level": "Intermediate", "complexityScore": 80, "recruiterValue": 85, 
      "projectWeightage": "<calculated_percentage>%", "technologies": ["React", "Node.js"], "realWorldImpact": "String", "scalability": "String", 
      "deploymentPractices": "String", "strengths": ["String"], "suggestions": ["String"], "optimizedDescription": "String", 
      "keywordsChanged": ["Keyword1 (Added)", "Keyword2 (Improved)"], "aiIntegration": "Yes"
    }}
  ],
  "skillAnalysis": {{
    "skillStrengthScore": 80, "marketRelevanceScore": 85, "hiringDemandScore": 90,
    "technicalSkills": ["String"], "missingCriticalSkills": ["String"], "trendingSkills": ["String"],
    "topSkillsToAdd": ["String"], "skillGapAnalysis": "String"
  }},
  "recruiterSimulation": {{
    "wouldScheduleInterview": true, "hiringConfidence": "High", "reasonForDecision": "String",
    "technicalImpression": "String", "projectQualityReview": "String", "resumeReadabilityReview": "String",
    "standoutElements": ["String"], "redFlags": ["String"]
  }},
  "atsEngine": {{
    "readabilityScore": 90, "keywordDensity": "Optimal", "atsPassPrediction": "High chance to pass",
    "keywordsFound": ["String"], "missingKeywords": ["String"], "whyScoreChanged": "String"
  }},
  "jobMatchAnalysis": {{
    "matchPercentage": 85, "roleCompatibility": "Strong", "yearsExperienceDetected": "3",
    "missingRequirements": ["String"]
  }},
  "sectionAnalysis": {{
    "summary": {{
      "score": 85, "detected": ["String"], "strengths": ["String"], "weaknesses": ["String"], 
      "suggestions": ["String"], "optimizedVersion": "String", "impactfulLines": ["String"], "weakLines": ["String"]
    }},
    "experience": {{
      "score": 85, "detected": ["String"], "strengths": ["String"], "weaknesses": ["String"], 
      "suggestions": ["String"], "optimizedVersion": "String", "impactfulLines": ["String"], "weakLines": ["String"]
    }},
    "education": {{
      "score": 90, "detected": ["String"], "strengths": ["String"], "weaknesses": ["String"], 
      "suggestions": ["String"], "optimizedVersion": "String", "impactfulLines": ["String"], "weakLines": ["String"]
    }},
    "projects": {{
      "score": 88, "detected": ["String"], "strengths": ["String"], "weaknesses": ["String"], 
      "suggestions": ["String"], "optimizedVersion": "String", "impactfulLines": ["String"], "weakLines": ["String"]
    }},
    "skills": {{
      "score": 80, "detected": ["String"], "strengths": ["String"], "weaknesses": ["String"], 
      "suggestions": ["String"], "optimizedVersion": "String", "impactfulLines": ["String"], "weakLines": ["String"]
    }}
  }},
  "improvementRoadmap": [
    {{"priority": "High", "action": "String", "impact": "String", "timeToComplete": "String"}}
  ]
}}

Resume:
{resume_text}
"""
    try:
        raw_text = _orchestrate_gemini_fallback(prompt)
        parsed_json = extract_json_from_text(raw_text)
        if not parsed_json:
            raise ValueError("Failed to parse JSON")
        return validate_resume_scores(parsed_json)
    except Exception as e_gemini:
        print(f"[Fallback Triggered] Gemini Resume analysis failed: {e_gemini}. Trying Groq...")
        try:
            raw_text = _orchestrate_groq_fallback(prompt)
            parsed_json = extract_json_from_text(raw_text)
            if not parsed_json:
                raise ValueError("Failed to parse JSON")
            return validate_resume_scores(parsed_json)
        except Exception as e_groq:
            print(f"[Fallback Triggered] Groq Resume analysis failed: {e_groq}. Using algorithmic fallback.")
            return validate_resume_scores(get_fallback_resume_analysis(resume_text, target_role))

def generate_questions(role: str, type: str, difficulty: str, count: int = 10, resume_context: str = None, avoid_questions: list = None) -> list:
    avoid_prompt = ""
    if avoid_questions and len(avoid_questions) > 0:
        avoid_str = "\n".join([f"- {q}" for q in avoid_questions])
        avoid_prompt = f"\nCRITICAL: DO NOT ask any of the following questions or anything highly similar, as the candidate has already answered them in the past:\n{avoid_str}\n"

    base_prompt_instructions = f"""You are an elite technical recruiter from a top-tier MNC (like FAANG, Microsoft, Amazon) conducting a real-time conversational interview. Generate {count} {difficulty} {type} interview questions for the following candidate profile: '{role}'.
(Note: The profile string contains the job role, experience level, and specific industry domain).
You MUST precisely tailor the complexity and depth of the questions strictly based on the candidate's experience level in the profile string.
You MUST ask REAL, pragmatic interview questions specific to the requested role and domain, exactly as they are asked in actual MNC interviews. 
CRITICAL CATEGORY ENFORCEMENT: Since this is a {type} interview, you MUST ask ONLY {type} questions. Do NOT mix technical questions in an HR/Behavioral interview, and do NOT mix HR/Behavioral questions in a Technical interview.
Make them highly UNIQUE, realistic, and challenging. DO NOT repeat standard or cliché interview questions.
CRITICAL: NEVER return placeholder questions like "Sample Question 1". Every question must be fully fleshed out and realistic.{avoid_prompt}"""

    if resume_context:
        prompt = f"""{base_prompt_instructions}
Base these deeply on the candidate's actual resume provided below.
CRITICAL: You MUST provide a balanced mix of questions:
1. Tools & Technologies (Heavily test their depth of knowledge on specific programming languages, frameworks, and libraries listed in their resume).
2. Project-based questions (asking about specific architectural decisions or challenges in their listed projects).
3. Work experience-based questions (asking about their specific roles, impact, and real-world scenarios).
WARNING: Do NOT solely focus on deep technical project parts. Ensure you ask direct, hard technical questions about their tools and technologies.

Resume:
{resume_context}

Return ONLY a JSON array of objects: [{{"question": "string", "category": "string"}}]"""
    else:
        prompt = f"""{base_prompt_instructions}

Return ONLY a JSON array of objects: [{{"question": "string", "category": "string"}}]"""

    def process_result(raw):
        res = extract_json_from_text(raw)
        if isinstance(res, list) and len(res) > 0:
            return res
        elif isinstance(res, dict):
            for val in res.values():
                if isinstance(val, list) and len(val) > 0:
                    return val
        raise ValueError("Invalid JSON format for questions.")

    try:
        raw_text = _orchestrate_gemini_fallback(prompt)
        return process_result(raw_text)
    except Exception as e_gemini:
        print(f"[Fallback Triggered] Gemini Question generation failed: {e_gemini}. Trying Groq...")
        try:
            raw_text = _orchestrate_groq_fallback(prompt)
            return process_result(raw_text)
        except Exception as e_groq:
            print(f"[Fallback Triggered] Groq Question generation failed: {e_groq}. Using algorithmic fallback.")
            return get_dynamic_fallback_questions(role, type, difficulty, count)


def generate_next_question(role: str, type: str, difficulty: str, history: list, resume_context: str = None) -> dict:
    history_text = "\n".join([f"Q: {h['question']}\nA: {h['answer']}" for h in history])
    
    prompt = f"""You are an elite technical recruiter from a top-tier MNC (like FAANG, Microsoft, Amazon) conducting a real-time conversational interview for the following candidate profile: '{role}'.
(Note: The profile string contains the job role, experience level, and specific industry domain).
The interview type is {type} and the difficulty is {difficulty}.

CRITICAL CATEGORY ENFORCEMENT: Since this is a {type} interview, you MUST ask ONLY {type} questions. Do NOT mix technical questions in an HR/Behavioral interview, and do NOT mix HR/Behavioral questions in a Technical interview.

Here is the conversation history so far:
{history_text}
"""
    if resume_context:
        prompt += f"\nCandidate's Resume:\n{resume_context}\n"
        
    prompt += """
Based on the conversation history and the resume, generate the NEXT logical, realistic, and challenging follow-up question.
You MUST precisely tailor the complexity and depth of the question strictly based on the candidate's experience level in the profile string.
You MUST ask REAL, pragmatic interview questions specific to the domain, exactly as asked in real interviews. DO NOT ask random theoretical stuff.
CRITICAL: Do NOT repeat previous questions. Ensure the question is highly UNIQUE. 
WARNING: Do NOT solely focus on deep technical project parts. Ensure you actively ask direct, hard technical questions testing their depth of knowledge on the specific programming languages, tools, frameworks, and libraries listed in their resume.
Probe deeper into their last answer or introduce a completely new, unexpected scenario related to the topic to test their adaptability.
Return ONLY a JSON object: {{"question": "string", "category": "string"}}"""

    def process_result(raw):
        res = extract_json_from_text(raw)
        if isinstance(res, dict) and "question" in res:
            return res
        if isinstance(res, list) and len(res) > 0 and "question" in res[0]:
            return res[0]
        raise ValueError("Invalid JSON format for next question.")

    try:
        raw_text = _orchestrate_gemini_fallback(prompt)
        return process_result(raw_text)
    except Exception as e_gemini:
        print(f"[Fallback Triggered] Gemini Next Question failed: {e_gemini}. Trying Groq...")
        try:
            raw_text = _orchestrate_groq_fallback(prompt)
            return process_result(raw_text)
        except Exception as e_groq:
            print(f"[Fallback Triggered] Groq Next Question failed: {e_groq}. Using fallback.")
            return {"question": f"Could you elaborate more on your experience with {role} technologies?", "category": "General"}


def evaluate_answer(question: str, answer: str, role: str) -> dict:
    prompt = f"""You are a FAANG hiring manager. Evaluate this {role} interview answer.
Question: {question}
Answer: {answer}

Perform a rigorous analysis. Evaluate confidence (based on phrasing and assertiveness) and communication skills. Count filler words if they appear (um, like, you know).

Return ONLY valid JSON: 
{{
  "score": <0-100>, 
  "feedback": "string", 
  "strengths": ["string"], 
  "weaknesses": ["string"], 
  "suggestedAnswer": "string",
  "confidenceScore": <0-100>,
  "communicationMetrics": {{
    "fillerWords": <int>,
    "pace": "string",
    "clarity": "string"
  }}
}}"""
    
    def process_eval(raw):
        res = extract_json_from_text(raw)
        if isinstance(res, dict) and "score" in res:
            return res
        raise ValueError("Invalid JSON format for answer evaluation.")

    try:
        raw_text = _orchestrate_gemini_fallback(prompt)
        return process_eval(raw_text)
    except Exception as e_gemini:
        print(f"[Fallback Triggered] Gemini Answer evaluation failed: {e_gemini}. Trying Groq...")
        try:
            raw_text = _orchestrate_groq_fallback(prompt)
            return process_eval(raw_text)
        except Exception as e_groq:
            print(f"[Fallback Triggered] Groq Answer evaluation failed: {e_groq}. Using algorithmic fallback.")
            return get_fallback_answer_evaluation(question, answer, role)
