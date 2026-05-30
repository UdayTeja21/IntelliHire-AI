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
        return generate_gemini(prompt, max_retries=0)
    except Exception as e_gemini:
        print(f"[LLM Orchestrator] Gemini failed: {e_gemini}")
        raise RuntimeError("Primary Resume LLM failed.")

def _orchestrate_groq_fallback(prompt: str) -> str:
    """
    Mock Interview Fallback: Groq -> Local Fallback
    """
    try:
        print("[LLM Orchestrator] Attempting Groq for Mock Interview...")
        return generate_groq(prompt, max_retries=0)
    except Exception as e_groq:
        print(f"[LLM Orchestrator] Groq failed: {e_groq}")
        raise RuntimeError("Primary Interview LLM failed.")

def analyze_resume(resume_text: str, target_role: str) -> dict:
    prompt = f"""
You are an elite AI recruitment intelligence engine used by FAANG companies. 
Perform a DEEP, INTELLIGENT, LINE-BY-LINE analysis of this resume for the role: {target_role}

CRITICAL INSTRUCTION: For "projectAnalysis", you MUST extract EVERY SINGLE project found in the resume as a completely separate JSON object. Do not group them. For each project, you MUST provide its specific "technologies" (tech stack), a dedicated "projectWeightage" (its percentage impact on the resume), and tailored "suggestions" for improvements. Do NOT hallucinate.

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
      "name": "String (exact name from resume)", "level": "Intermediate", "complexityScore": 80, "recruiterValue": 85, 
      "projectWeightage": "25%", "technologies": ["React", "Node.js"], "realWorldImpact": "String", "scalability": "String", 
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

def generate_questions(role: str, type: str, difficulty: str, count: int = 10, resume_context: str = None) -> list:
    if resume_context:
        prompt = f"""You are an elite technical recruiter conducting a real-time conversational interview. Generate {count} {difficulty} {type} interview questions for a {role} position.
Base these deeply on the candidate's actual resume provided below. Create dynamic, challenging, and highly relevant questions.
CRITICAL: NEVER return placeholder questions like "Sample Question 1". Every question must be fully fleshed out and realistic.

Resume:
{resume_context}

Return ONLY a JSON array of objects: [{{"question": "string", "category": "string"}}]"""
    else:
        prompt = f"""You are an elite technical recruiter conducting a real-time conversational interview. Generate {count} {difficulty} {type} interview questions for a {role}. Make them realistic, specific to the role, and challenging.
CRITICAL: NEVER return placeholder questions like "Sample Question 1". Every question must be fully fleshed out and realistic.

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
