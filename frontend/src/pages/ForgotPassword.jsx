// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

// ── Forgot Password Page ──────────────────────────────────────────
function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  async function handleSubmit() {
    if (!email.trim()) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return }

    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
          <h2 style={styles.title}>Check Your Email!</h2>
          <p style={styles.sub}>
            If <strong>{email}</strong> is registered, a reset link has been sent.
          </p>
          <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
            ⏰ Link valid for 30 minutes
          </p>
          <button onClick={() => navigate('/auth')} style={styles.btn}>
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
        <h2 style={styles.title}>Forgot Password?</h2>
        <p style={styles.sub}>Enter your email — we'll send a reset link</p>

        {error && <div style={styles.error}>❌ {error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="example@gmail.com"
            style={styles.input}
          />
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
        </button>

        <button onClick={() => navigate('/auth')} style={styles.backBtn}>
          ← Back to Login
        </button>
      </div>
    </div>
  )
}

// ── Reset Password Page ───────────────────────────────────────────
function ResetPasswordPage() {
  const [searchParams]        = useSearchParams()
  const token                 = searchParams.get('token')
  const [password, setPass]   = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  async function handleReset() {
    if (!password) { setError('Password is required'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (!token) { setError('Invalid link'); return }

    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/reset-password', { token, password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={styles.title}>Invalid Link</h2>
          <p style={styles.sub}>This link is invalid — please try forgot password again</p>
          <button onClick={() => navigate('/forgot-password')} style={styles.btn}>Try Again</button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={styles.title}>Password Changed Successfully!</h2>
          <p style={styles.sub}>Now login with your new password</p>
          <button onClick={() => navigate('/auth')} style={styles.btn}>🔑 Login</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={styles.title}>Create New Password</h2>
        <p style={styles.sub}>Choose a strong password</p>

        {error && <div style={styles.error}>❌ {error}</div>}

        <div style={{ marginBottom: 14 }}>
          <label style={styles.label}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPass(e.target.value); setError('') }}
              placeholder="At least 8 characters"
              style={{ ...styles.input, paddingRight: 44 }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18 }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleReset()}
            placeholder="Re-enter password"
            style={styles.input}
          />
        </div>

        <button onClick={handleReset} disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? '⏳ Changing...' : '🔒 Change Password'}
        </button>
      </div>
    </div>
  )
}

// ── Main Export — route se decide hoga ───────────────────────────
export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  return token ? <ResetPasswordPage /> : <ForgotPasswordPage />
}

// ── Styles ────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0A1F10 0%, #1B4D2E 50%, #2D7A47 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  card: {
    background: 'white', borderRadius: 24, padding: '40px 32px',
    width: '100%', maxWidth: 420, textAlign: 'center',
    boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
  },
  title: { color: '#1B4D2E', fontSize: 22, fontWeight: 800, margin: '0 0 8px' },
  sub:   { color: '#666', fontSize: 13, margin: '0 0 24px', lineHeight: 1.5 },
  error: { background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 10, padding: '10px 14px', color: '#CC0000', fontSize: 13, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 700, color: '#1B4D2E', display: 'block', marginBottom: 6, textAlign: 'left' },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #C8EDD6', background: '#F8FFF8', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  btn: { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #1B4D2E, #2D7A47)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(27,77,46,0.4)' },
  backBtn: { width: '100%', padding: '12px', borderRadius: 14, border: '1px solid #C8EDD6', background: 'transparent', color: '#666', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
}