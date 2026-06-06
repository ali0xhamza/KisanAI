// src/components/UserFeedback.jsx
import { useState } from "react";
import axios from "axios";

const TYPES = [
  { value: "bug",       label: "Bug Report",       icon: "🐛" },
  { value: "feature",   label: "Feature Request",  icon: "💡" },
  { value: "feedback",  label: "General Feedback", icon: "👍" },
  { value: "complaint", label: "Complaint",        icon: "⚠️" },
];

export default function UserFeedback() {
  const [type, setType]       = useState("feedback");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("All fields are required!");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/user-feedback`, {
        name, email, feedback_type: type, message,
      });
      setSuccess(true);
      setName(""); setEmail(""); setMessage(""); setType("feedback");
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Styles – dark theme consistent with the app
  const s = {
    section: {
      background: 'linear-gradient(145deg, #0a0f0a 0%, #0c1408 100%)',
      padding: "80px 20px",
      borderTop: "1px solid rgba(201,144,58,0.15)",
    },
    inner: {
      maxWidth: "700px",
      margin: "0 auto",
    },
    badge: {
      display: "inline-block",
      background: "rgba(201,144,58,0.12)",
      border: "1px solid rgba(201,144,58,0.25)",
      color: "#E8B86D",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "2px",
      padding: "6px 18px",
      borderRadius: "40px",
      textTransform: "uppercase",
      marginBottom: "20px",
    },
    heading: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(32px, 5vw, 44px)",
      fontWeight: "800",
      color: "#F0E8D8",
      marginBottom: "12px",
      letterSpacing: "-0.5px",
    },
    sub: {
      fontSize: "15px",
      color: "rgba(240,232,216,0.55)",
      marginBottom: "40px",
      lineHeight: "1.6",
    },
    card: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "28px",
      padding: "32px",
      backdropFilter: "blur(4px)",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#C9903A",
      marginBottom: "8px",
      letterSpacing: "0.5px",
    },
    typeGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "10px",
      marginBottom: "28px",
    },
    typeBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 16px",
      borderRadius: "14px",
      border: active ? "2px solid #C9903A" : "1px solid rgba(255,255,255,0.1)",
      background: active ? "rgba(201,144,58,0.12)" : "transparent",
      color: active ? "#E8B86D" : "rgba(240,232,216,0.6)",
      fontSize: "13px",
      fontWeight: active ? "600" : "400",
      cursor: "pointer",
      transition: "all 0.2s",
      justifyContent: "center",
    }),
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "20px",
    },
    field: {
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "#1e1e1e",
      fontSize: "14px",
      color: "#F0E8D8",
      outline: "none",
      boxSizing: "border-box",
      transition: "all 0.2s",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "#1e1e1e",
      fontSize: "14px",
      color: "#F0E8D8",
      outline: "none",
      resize: "vertical",
      minHeight: "120px",
      boxSizing: "border-box",
      fontFamily: "inherit",
      lineHeight: "1.6",
    },
    charCount: {
      textAlign: "right",
      fontSize: "11px",
      color: "rgba(240,232,216,0.4)",
      marginTop: "4px",
    },
    errorBox: {
      background: "rgba(220,38,38,0.15)",
      border: "1px solid #dc2626",
      borderRadius: "12px",
      padding: "12px 16px",
      color: "#f0e8d8",
      fontSize: "13px",
      marginBottom: "20px",
    },
    submitBtn: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg,#C9903A,#A87A28)",
      color: "#0A0602",
      border: "none",
      borderRadius: "40px",
      fontSize: "15px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.2s",
      marginTop: "8px",
    },
    successWrap: {
      textAlign: "center",
      padding: "20px 0",
    },
    successIcon: {
      fontSize: "60px",
      marginBottom: "16px",
    },
    successTitle: {
      fontSize: "24px",
      fontWeight: "800",
      color: "#F0E8D8",
      marginBottom: "8px",
    },
    successSub: {
      fontSize: "14px",
      color: "rgba(240,232,216,0.55)",
      marginBottom: "28px",
    },
    resetBtn: {
      display: "inline-block",
      padding: "12px 28px",
      background: "linear-gradient(135deg,#C9903A,#A87A28)",
      color: "#0A0602",
      borderRadius: "40px",
      border: "none",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "transform 0.2s",
    },
  };

  if (success) {
    return (
      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.card}>
            <div style={s.successWrap}>
              <div style={s.successIcon}>✅</div>
              <h3 style={s.successTitle}>Thank you! Feedback received</h3>
              <p style={s.successSub}>We will review it soon and contact you if needed.</p>
              <button
                style={s.resetBtn}
                onClick={() => setSuccess(false)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Submit More Feedback
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={s.section}>
      <div style={s.inner}>
        <div style={{ textAlign: 'center' }}>
          <span style={s.badge}>📬 Share Your Opinion</span>
          <h2 style={s.heading}>Help Us Improve KisanAI</h2>
          <p style={s.sub}>Your feedback directly shapes our future updates.</p>
        </div>

        <div style={s.card}>
          {/* Feedback Type Selector */}
          <div>
            <label style={s.label}>Feedback Type</label>
            <div style={s.typeGrid}>
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  style={s.typeBtn(type === t.value)}
                >
                  <span style={{ fontSize: "18px" }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.row}>
              <div>
                <label style={s.label}>Name <span style={{ color: "#C9903A" }}>*</span></label>
                <input
                  type="text"
                  style={s.input}
                  placeholder="Ali Hamza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#C9903A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <div>
                <label style={s.label}>Email <span style={{ color: "#C9903A" }}>*</span></label>
                <input
                  type="email"
                  style={s.input}
                  placeholder="ali@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#C9903A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Message <span style={{ color: "#C9903A" }}>*</span></label>
              <textarea
                style={s.textarea}
                placeholder="Write your issue or feedback here..."
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#C9903A'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              <div style={s.charCount}>{message.length}/500</div>
            </div>

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <button
              type="submit"
              style={s.submitBtn}
              disabled={loading}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? "⏳ Sending..." : "📩 Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}