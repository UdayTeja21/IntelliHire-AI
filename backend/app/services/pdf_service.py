import json
from fpdf import FPDF
from app.db import models

class PDFReport(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.set_text_color(79, 70, 229) # Indigo 600
        self.cell(0, 10, 'IntelliHire AI - Interview Report', 0, 1, 'C')
        self.line(10, 22, 200, 22)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_interview_pdf(session: models.InterviewSession, questions: list[models.InterviewQuestion]) -> bytes:
    pdf = PDFReport()
    pdf.add_page()
    
    # Session Details
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, f"Target Role: {session.role}", 0, 1)
    pdf.cell(0, 8, f"Interview Type: {session.type} ({session.difficulty})", 0, 1)
    
    pdf.set_text_color(16, 185, 129) if (session.overall_score or 0) >= 75 else pdf.set_text_color(245, 158, 11)
    pdf.cell(0, 8, f"Overall Score: {session.overall_score}%", 0, 1)
    pdf.ln(5)
    
    pdf.set_text_color(0, 0, 0)
    
    # Questions
    for i, q in enumerate(questions, 1):
        pdf.set_font("helvetica", "B", 11)
        # Use simple latin-1 encoding approach or replace unsupported chars
        q_text = str(q.question_text).encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 8, f"Q{i}: {q_text}")
        
        pdf.set_font("helvetica", "", 10)
        ans_text = str(q.candidate_answer or 'No answer provided').encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 8, f"Your Answer: {ans_text}")
        
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(0, 8, f"Score: {q.score or 0}/100", 0, 1)
        
        pdf.set_font("helvetica", "I", 10)
        if q.feedback_json:
            try:
                fb = json.loads(q.feedback_json)
                feedback_text = str(fb.get('feedback', '')).encode('latin-1', 'replace').decode('latin-1')
                ideal_text = str(fb.get('ideal_answer', '')).encode('latin-1', 'replace').decode('latin-1')
                pdf.multi_cell(0, 6, f"Feedback: {feedback_text}")
                pdf.ln(2)
                pdf.multi_cell(0, 6, f"Ideal Answer: {ideal_text}")
            except Exception:
                pass
                
        pdf.ln(6)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(6)
        
    return pdf.output()
