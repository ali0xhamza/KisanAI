// src/pages/PrivacyPolicy.jsx
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1F10 0%, #1B4D2E 50%, #2D7A47 100%)',
      padding: '100px 20px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.96)',
        borderRadius: 32,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1B4D2E, #2D7A47)',
          padding: '32px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h1 style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 32 }}>🔒</span> Privacy Policy
          </h1>
          <p style={{ color: '#A7D9B5', margin: '8px 0 0', fontSize: 14 }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div style={{ padding: '40px', lineHeight: 1.8, color: '#1a1a1a', fontSize: 15 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1B4D2E', marginBottom: 20 }}>
            Your privacy is important to us. This policy explains how KisanAI collects, uses, and protects your data.
          </p>

          <h2 style={{ color: '#2D7A47', fontSize: 20, marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h2>
          <ul style={{ paddingLeft: 24 }}>
            <li><strong>Personal info:</strong> Name, email address, phone number (optional), city, main crop, soil type, land area – provided during registration or settings.</li>
            <li><strong>Farm data:</strong> Crop health images (for disease detection), expenses, income, diary entries, community posts/comments.</li>
            <li><strong>Location:</strong> Your city/town (manually selected or via GPS) to show weather forecasts and local mandi prices.</li>
            <li><strong>Usage data:</strong> Chat history, feature usage, feedback submitted.</li>
          </ul>

          <h2 style={{ color: '#2D7A47', fontSize: 20, marginTop: 32, marginBottom: 12 }}>2. How We Use Your Information</h2>
          <ul>
            <li>To provide AI‑powered farming advice (disease detection, fertilizer guide, spray calculator, yield prediction).</li>
            <li>To show weather forecasts and live mandi prices based on your location.</li>
            <li>To personalise your experience (e.g., recommend crops based on your soil and area).</li>
            <li>To improve our AI models and app features through anonymous analytics.</li>
          </ul>

          <h2 style={{ color: '#2D7A47', fontSize: 20, marginTop: 32, marginBottom: 12 }}>3. Data Sharing</h2>
          <ul>
            <li>We <strong>do not sell or rent</strong> your personal data to third parties.</li>
            <li>We share necessary data with external services only to provide core features:
              <ul>
                <li><strong>OpenWeatherMap</strong> – to fetch weather data (your location is sent).</li>
                <li><strong>AMIS Punjab</strong> – to fetch mandi prices (city name is sent).</li>
                <li><strong>Groq AI (Llama model)</strong> – your questions, crop symptoms, and uploaded photos are processed to generate advice. Images are not stored permanently.</li>
              </ul>
            </li>
            <li>Your farm data (expenses, diary, community posts) is stored securely in our PostgreSQL database and is only visible to you.</li>
          </ul>

          <h2 style={{ color: '#2D7A47', fontSize: 20, marginTop: 32, marginBottom: 12 }}>4. Data Security</h2>
          <p>We use industry‑standard security measures (JWT authentication, HTTPS, password hashing) to protect your data. However, no system is 100% secure; use at your own risk.</p>

          <h2 style={{ color: '#2D7A47', fontSize: 20, marginTop: 32, marginBottom: 12 }}>5. Your Rights</h2>
          <ul>
            <li>You can update or delete your profile information anytime from Settings.</li>
            <li>You can request permanent deletion of your account and all associated data by contacting us (see Section 7).</li>
            <li>You can clear chat history or delete individual posts/comments from the app.</li>
          </ul>

          <h2 style={{ color: '#2D7A47', fontSize: 20, marginTop: 32, marginBottom: 12 }}>6. Children's Privacy</h2>
          <p>KisanAI is not intended for children under 13. We do not knowingly collect information from children.</p>

          <h2 style={{ color: '#2D7A47', fontSize: 20, marginTop: 32, marginBottom: 12 }}>7. Contact Us</h2>
          <p>If you have questions about this policy, please email us at: <strong>kisanai.noreply@gmail.com</strong> (or use the feedback form inside the app).</p>

          <div style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid #E8F4E8',
            textAlign: 'center',
            fontSize: 13,
            color: '#666',
          }}>
            <Link to="/" style={{ color: '#2D7A47', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
            <span style={{ margin: '0 12px' }}>·</span>
            <Link to="/terms" style={{ color: '#2D7A47', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  )
}