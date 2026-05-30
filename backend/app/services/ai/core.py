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
        return generate_gemini(prompt)
    except Exception as e_gemini:
        print(f"[LLM Orchestrator] Gemini failed: {e_gemini}")
        raise RuntimeError("Primary Resume LLM failed.")

def _orchestrate_groq_fallback(prompt: str) -> str:
    """
    Mock Interview Fallback: Groq -> Local Fallback
    """
    try:
        print("[LLM Orchestrator] Attempting Groq for Mock Interview...")
        return generate_groq(prompt)
    except Exception as e_groq:
        print(f"[LLM Orchestrator] Groq failed: {e_groq}")
        raise RuntimeError("Primary Interview LLM failed.")

def analyze_resume(resume_text: str, target_role: str) -> dict:
    prompt = f"""
You are an elite AI recruitment intelligence engine used by FAANG companies. 
Perform a DEEP, INTELLIGENT, LINE-BY-LINE analysis of this resume for the role: {target_role}

CRITICAL INSTRUCTION: For "projectAnalysis", you MUST extract ALL projects that are ACTUALLY present in the provided resume. DO NOT hallucinate, invent, or output random projects. Base everything strictly on the provided text. Provide a "projectWeightage" (percentage of overall impact of this project on the resume) and a list of "keywordsChanged" indicating what ATS keywords you added or optimized in the optimizedDescription.

CRITICAL INSTRUCTION: For "improvementRoadmap", provide a highly specific, dynamic improvement plan based strictly on the candidate's actual resume gaps, missing skills, or weak areas. Do NOT output generic advice like "ensure document is pure" or "remove complexity".

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
    except Exception as e:
        print(f"[Fallback Triggered] Resume analysis failed: {e}")
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

    try:
        raw_text = _orchestrate_gemini_fallback(prompt)
        result = extract_json_from_text(raw_text)
        
        if isinstance(result, list) and len(result) > 0:
            return result
        elif isinstance(result, dict):
            for val in result.values():
                if isinstance(val, list) and len(val) > 0:
                    return val
        raise ValueError("Invalid JSON format for questions.")
    except Exception as e:
        print(f"[Fallback Triggered] Question generation failed: {e}")
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
    
    try:
        raw_text = _orchestrate_gemini_fallback(prompt)
        result = extract_json_from_text(raw_text)
        if isinstance(result, dict) and "score" in result:
            return result
        raise ValueError("Invalid JSON format for answer evaluation.")
    except Exception as e:
        print(f"[Fallback Triggered] Answer evaluation failed: {e}")
        return get_fallback_answer_evaluation(question, answer, role)
