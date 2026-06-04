import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import base64
from typing import Optional
from app.core.config import settings

SMTP_USER = settings.SMTP_USER
SMTP_PASSWORD = settings.SMTP_PASSWORD

# --- Base Template System ---
def get_base_html(title: str, content: str) -> str:
    """Returns a highly professional SaaS-like HTML wrapper for all emails."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f8fafc;
                color: #334155;
                -webkit-font-smoothing: antialiased;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                overflow: hidden;
                border: 1px solid #f1f5f9;
            }}
            .header {{
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                padding: 32px 40px;
                text-align: center;
            }}
            .header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }}
            .content {{
                padding: 40px;
                line-height: 1.6;
                font-size: 16px;
            }}
            h2 {{
                color: #0f172a;
                font-size: 20px;
                font-weight: 700;
                margin-top: 0;
                margin-bottom: 20px;
            }}
            p {{
                margin: 0 0 16px;
            }}
            .btn {{
                display: inline-block;
                background-color: #4f46e5;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 28px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
                margin-top: 10px;
                margin-bottom: 10px;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 32px 40px;
                text-align: center;
                border-top: 1px solid #f1f5f9;
            }}
            .footer p {{
                color: #94a3b8;
                font-size: 13px;
                margin: 0 0 8px;
            }}
            .links a {{
                color: #64748b;
                text-decoration: none;
                margin: 0 8px;
                font-size: 13px;
            }}
            .links a:hover {{
                color: #4f46e5;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>IntelliHire AI</h1>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>You're receiving this email because of your account at IntelliHire AI.</p>
                <div class="links">
                    <a href="#">Help Center</a> &bull; 
                    <a href="#">Privacy Policy</a> &bull; 
                    <a href="#">Terms of Service</a>
                </div>
                <p style="margin-top: 16px; font-size: 12px; color: #cbd5e1;">&copy; 2026 IntelliHire AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

# --- Core Sending Logic ---
def _send_email(to_email: str, subject: str, html_content: str, attachments: list = None):
    if not SMTP_PASSWORD:
        print(f"\n--- [Mock Email to {to_email}] ---\nSubject: {subject}\n[HTML Content Length: {len(html_content)} chars]\n------------------------------------\n")
        return

    msg = MIMEMultipart()
    msg['From'] = f"IntelliHire AI <{SMTP_USER}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(html_content, 'html'))

    if attachments:
        for attachment in attachments:
            try:
                # If attachment is passed as base64 from previous logic, decode it
                content = base64.b64decode(attachment["content"]) if isinstance(attachment.get("content"), str) else attachment["content"]
                
                part = MIMEApplication(content, Name=attachment["filename"])
                part['Content-Disposition'] = f'attachment; filename="{attachment["filename"]}"'
                msg.attach(part)
            except Exception as e:
                print(f"Error attaching file: {e}")

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email successfully sent to {to_email} via SMTP")
    except Exception as e:
        print(f"Exception sending email via SMTP: {str(e)}")


# --- Email Triggers ---
def send_welcome_email(to_email: str, user_name: str):
    title = "Welcome to IntelliHire AI!"
    content = f"""
    <h2>Welcome aboard, {user_name}! 🚀</h2>
    <p>Thank you for successfully creating an account at <strong>IntelliHire AI</strong>. We are thrilled to have you join our platform.</p>
    <p>Our goal is to help you master your technical and behavioral interviews with real-time AI feedback. By consistently practicing, you'll gain the confidence you need to land your dream role.</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://intellihire-ai-eight.vercel.app/interview" class="btn">Start Your First Interview</a>
    </div>
    <p>If you have any questions or need assistance, our support team is always here to help.</p>
    <p>Happy practicing!<br/><strong>The IntelliHire Team</strong></p>
    """
    html = get_base_html(title, content)
    _send_email(to_email, title, html)

def send_password_change_email(to_email: str, user_name: str):
    title = "Security Alert: Password Changed"
    content = f"""
    <h2>Hi {user_name},</h2>
    <p>This is a quick security notification to let you know that your password was successfully changed.</p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; font-weight: 600;">If you made this change, no further action is required.</p>
    </div>
    <p>If you did <strong>not</strong> authorize this change, please contact our support team immediately to secure your account.</p>
    <p>Stay secure,<br/><strong>The IntelliHire Security Team</strong></p>
    """
    html = get_base_html(title, content)
    _send_email(to_email, title, html)

def send_completion_email(to_email: str, user_name: str, pdf_bytes: bytes):
    title = "Your Interview Performance Report"
    content = f"""
    <h2>Great job, {user_name}! 🎯</h2>
    <p>You have successfully completed your mock interview session. Consistent practice is the secret to success.</p>
    <p>We've attached a detailed, multi-page <strong>Performance Report (PDF)</strong> to this email. It contains a breakdown of every question, your answers, and specific feedback from our AI to help you improve.</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://intellihire-ai-eight.vercel.app/reports" class="btn">View Dashboard Analytics</a>
    </div>
    <p>Review your feedback, identify your weak spots, and jump back in when you're ready!</p>
    <p>Best regards,<br/><strong>The IntelliHire Coaching Team</strong></p>
    """
    html = get_base_html(title, content)
    
    pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
    attachments = [{
        "filename": "IntelliHire_Performance_Report.pdf",
        "content": pdf_b64
    }]
    
    _send_email(to_email, title, html, attachments)

def send_consistency_email(to_email: str, user_name: str, streak_days: int):
    title = f"🔥 Day {streak_days} Streak! Keep it going"
    content = f"""
    <h2>Keep the momentum, {user_name}!</h2>
    <p>You are officially on a <strong>Day {streak_days}</strong> consistency streak.</p>
    <p>Studies show that consistent, daily practice increases interview pass rates by up to 300%. Even just 10 minutes of mock interviewing today will keep your skills sharp.</p>
    <div style="background-color: #fdf4ff; padding: 20px; border-radius: 12px; border: 1px solid #fbcfe8; text-align: center; margin: 24px 0;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔥</div>
        <div style="font-size: 24px; font-weight: 800; color: #db2777;">{streak_days} Day Streak</div>
    </div>
    <div style="text-align: center;">
        <a href="https://intellihire-ai-eight.vercel.app/interview" class="btn" style="background-color: #db2777;">Practice Now</a>
    </div>
    """
    html = get_base_html(title, content)
    _send_email(to_email, title, html)

def send_password_reset_email(to_email: str, user_name: str, reset_link: str):
    title = "Reset Your Password"
    content = f"""
    <h2>Hello {user_name},</h2>
    <p>We received a request to reset the password for your IntelliHire AI account.</p>
    <p>If you made this request, please click the button below to choose a new password. This link will expire in 15 minutes.</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{reset_link}" class="btn" style="background-color: #4f46e5;">Reset Password</a>
    </div>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #64748b; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #475569;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    <p>Best regards,<br/><strong>The IntelliHire Security Team</strong></p>
    """
    html = get_base_html(title, content)
    _send_email(to_email, title, html)

def send_otp_email(to_email: str, user_name: str, otp: str):
    title = "Your Password Reset OTP"
    content = f"""
    <h2>Hello {user_name},</h2>
    <p>We received a request to reset the password for your IntelliHire AI account.</p>
    <p>Please use the following 6-digit One Time Password (OTP) to reset your password. This OTP will expire in 10 minutes.</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; margin: 24px 0;">
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4f46e5;">{otp}</div>
    </div>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #64748b; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #475569;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    <p>Best regards,<br/><strong>The IntelliHire Security Team</strong></p>
    """
    html = get_base_html(title, content)
    _send_email(to_email, title, html)
