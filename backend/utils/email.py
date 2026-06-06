# backend/utils/email.py
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST     = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT     = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER     = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM     = os.getenv("EMAIL_FROM", EMAIL_USER)
FRONTEND_URL   = os.getenv("FRONTEND_URL", "http://localhost:5173")

def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email — returns True on success, False on failure."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = EMAIL_FROM
        msg["To"]      = to_email

        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


def send_password_reset_email(to_email: str, name: str, reset_token: str) -> bool:
    """Send password reset email."""
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f3faf4; padding: 20px; margin: 0;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1B4D2E, #2D7A47); padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">🌾</div>
          <h1 style="color: white; margin: 0; font-size: 24px;">KisanAI</h1>
          <p style="color: #A7D9B5; margin: 4px 0 0; font-size: 13px;">Smart Farming Assistant 🇵🇰</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #1B4D2E; margin: 0 0 16px;">Password Reset</h2>
          <p style="color: #444; line-height: 1.6; margin: 0 0 12px;">
            Dear <strong>{name}</strong>,
          </p>
          <p style="color: #444; line-height: 1.6; margin: 0 0 24px;">
            You requested to reset your password. Please click the button below:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="{reset_url}"
               style="background: linear-gradient(135deg, #1B4D2E, #2D7A47);
                      color: white; padding: 14px 32px; border-radius: 12px;
                      text-decoration: none; font-weight: bold; font-size: 15px;
                      display: inline-block;">
              🔑 Reset Password
            </a>
          </div>

          <p style="color: #888; font-size: 12px; line-height: 1.6; margin: 24px 0 0;">
            ⏰ This link is valid for <strong>30 minutes</strong>.<br>
            ⚠️ If you did not request this, please ignore this email.<br>
            🔒 Do not share your password with anyone.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f3faf4; padding: 16px; text-align: center; border-top: 1px solid #e0f0e0;">
          <p style="color: #999; font-size: 11px; margin: 0;">
            KisanAI – For Pakistani Farmers 🇵🇰
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, "KisanAI — Password Reset", html)


def send_welcome_email(to_email: str, name: str) -> bool:
    """Send welcome email after registration."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f3faf4; padding: 20px; margin: 0;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

        <div style="background: linear-gradient(135deg, #1B4D2E, #2D7A47); padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">🌾</div>
          <h1 style="color: white; margin: 0; font-size: 24px;">KisanAI</h1>
          <p style="color: #A7D9B5; margin: 4px 0 0; font-size: 13px;">Smart Farming Assistant 🇵🇰</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="color: #1B4D2E; margin: 0 0 16px;">Welcome! 🎉</h2>
          <p style="color: #444; line-height: 1.6; margin: 0 0 12px;">
            Dear <strong>{name}</strong>,
          </p>
          <p style="color: #444; line-height: 1.6; margin: 0 0 24px;">
            Welcome to KisanAI! You can now benefit from these features:
          </p>

          <div style="background: #f3faf4; border-radius: 12px; padding: 16px; margin: 0 0 24px;">
            <p style="margin: 6px 0; color: #1B4D2E; font-size: 14px;">🤖 AI Chatbot — Ask about your crops</p>
            <p style="margin: 6px 0; color: #1B4D2E; font-size: 14px;">🔬 Disease Detection — Identify crop diseases</p>
            <p style="margin: 6px 0; color: #1B4D2E; font-size: 14px;">💰 Mandi Prices — View real‑time market prices</p>
            <p style="margin: 6px 0; color: #1B4D2E; font-size: 14px;">🌤️ Weather — Check weather for your area</p>
            <p style="margin: 6px 0; color: #1B4D2E; font-size: 14px;">🎤 Voice — Ask questions by speaking</p>
          </div>

          <div style="text-align: center;">
            <a href="{FRONTEND_URL}"
               style="background: linear-gradient(135deg, #1B4D2E, #2D7A47);
                      color: white; padding: 14px 32px; border-radius: 12px;
                      text-decoration: none; font-weight: bold; font-size: 15px;
                      display: inline-block;">
              🌾 Open App
            </a>
          </div>
        </div>

        <div style="background: #f3faf4; padding: 16px; text-align: center; border-top: 1px solid #e0f0e0;">
          <p style="color: #999; font-size: 11px; margin: 0;">KisanAI – For Pakistani Farmers 🇵🇰</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, "Welcome to KisanAI! 🌾", html)