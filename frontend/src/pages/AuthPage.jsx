// src/pages/AuthPage.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

const cropOptions = [
  'Wheat', 'Rice', 'Sugarcane',
  'Cotton', 'Maize', 'Vegetables', 'Fruits'
]

function validateForm(mode, form) {
  const errors = {}
  if (mode === 'register') {
    if (!form.name.trim()) errors.name = 'Name is required'
    else if (form.name.trim().length < 3) errors.name = 'Name must be at least 3 characters'
    else if (form.name.trim().length > 50) errors.name = 'Name cannot exceed 50 characters'
    else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(form.name.trim())) errors.name = 'Name can only contain letters'
  }
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) errors.email = 'Enter a valid email address'
  else if (form.email.length > 100) errors.email = 'Email cannot exceed 100 characters'
  if (mode === 'register' && form.phone.trim()) {
    const phone = form.phone.trim().replace(/[-\s]/g, '')
    if (!/^(03\d{9}|3\d{9})$/.test(phone)) errors.phone = 'Phone format: 0300-1234567'
  }
  if (!form.password) errors.password = 'Password is required'
  else if (mode === 'register') {
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters'
    else if (form.password.length > 72) errors.password = 'Password cannot exceed 72 characters'
    else if (!/[A-Z]/.test(form.password) && !/[0-9]/.test(form.password)) errors.password = 'Must contain a number or capital letter'
  }
  if (mode === 'register' && form.password && form.confirmPassword !== undefined) {
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  }
  return errors
}

function getPasswordStrength(password) {
  if (!password) return null
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 1) return { label: 'Weak',        color: '#DC2626', width: '20%' }
  if (score <= 2) return { label: 'Fair',        color: '#F59E0B', width: '40%' }
  if (score <= 3) return { label: 'Good',        color: '#3B82F6', width: '65%' }
  if (score <= 4) return { label: 'Strong',      color: '#16A34A', width: '85%' }
  return             { label: 'Very Strong', color: '#15803D', width: '100%' }
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 4)  return digits
  if (digits.length <= 11) return digits.slice(0, 4) + '-' + digits.slice(4)
  return digits.slice(0, 4) + '-' + digits.slice(4, 11)
}

export default function AuthPage() {
  const [mode, setMode]         = useState('login')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [resendMsg, setResendMsg] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef([])

  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    confirmPassword: '', city: '', fasal_type: ''
  })
  const [errors, setErrors]     = useState({})
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [touched, setTouched]   = useState({})

  const { login, register, verifyOtp, resendOtp, loginWithGoogle, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (touched[k]) {
      const newErrors = validateForm(mode, { ...form, [k]: v })
      setErrors(prev => ({ ...prev, [k]: newErrors[k] }))
    }
    if (error) setError(null)
  }

  const setPhone = (v) => set('phone', formatPhone(v))

  const handleBlur = (k) => {
    setTouched(prev => ({ ...prev, [k]: true }))
    const newErrors = validateForm(mode, form)
    setErrors(prev => ({ ...prev, [k]: newErrors[k] }))
  }

  const handleSubmit = async () => {
    const allTouched = {}
    Object.keys(form).forEach(k => allTouched[k] = true)
    setTouched(allTouched)
    const validationErrors = validateForm(mode, form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    if (mode === 'login') {
      const result = await login(form.email.trim(), form.password)
      if (result.success) {
        navigate(result.role === 'admin' ? '/admin' : '/')
      } else if (result.requires_otp) {
        setOtpEmail(result.email)
        setMode('otp')
      }
    } else {
      const result = await register(
        form.name.trim(),
        form.email.trim().toLowerCase(),
        form.password,
        form.phone.replace(/[-\s]/g, ''),
        form.city.trim()
      )
      if (result.requires_otp) {
        setOtpEmail(result.email)
        setMode('otp')
      } else if (result.success) {
        navigate('/')
      }
    }
  }

  // ── OTP handlers ──────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (error) setError(null)
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setOtpDigits(paste.split(''))
      otpRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('')
    if (otp.length < 6) { setError('Enter the complete 6-digit OTP'); return }
    const result = await verifyOtp(otpEmail, otp)
    if (result.success) navigate(result.role === 'admin' ? '/admin' : '/')
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setResendMsg('')
    const result = await resendOtp(otpEmail)
    if (result.success) {
      setResendMsg('✅ New OTP sent!')
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
    } else {
      setResendMsg('❌ ' + result.error)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential)
    if (result.success) navigate(result.role === 'admin' ? '/admin' : '/')
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setErrors({})
    setTouched({})
    setError(null)
    setForm({ name: '', phone: '', email: '', password: '', confirmPassword: '', city: '', fasal_type: '' })
  }

  const strength = mode === 'register' ? getPasswordStrength(form.password) : null

  // ── OTP Screen ────────────────────────────────────────────────────
  if (mode === 'otp') {
    return (
      <div style={styles.container}>
        <div style={styles.bgLeaf1}>🌿</div>
        <div style={styles.bgLeaf2}>🌾</div>
        <div style={styles.bgBlur1} />
        <div style={styles.bgBlur2} />

        <div style={styles.card}>
          <div style={styles.cardTop} />
          <div style={styles.cardInner}>
            <div style={styles.brand}>
              <div style={styles.logoWrapper}>
                <span style={styles.logoIcon}>🌾</span>
              </div>
              <h1 style={styles.brandTitle}>Kisan<span style={styles.brandAccent}>AI</span></h1>
              <p style={styles.brandSub}>Email Verification</p>
            </div>

            <div style={styles.otpInfo}>
              <span style={{ fontSize: 32 }}>📧</span>
              <p style={{ margin: '8px 0 4px', fontWeight: 700, color: '#1B4D2E', fontSize: 16 }}>
                OTP has been sent!
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                A 6-digit code has been sent to {otpEmail}
              </p>
            </div>

            {error && (
              <div style={styles.alert}>
                <span style={styles.alertIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div style={styles.otpBoxRow} onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    ...styles.otpBox,
                    borderColor: digit ? '#1B4D2E' : '#E2E8F0',
                    background: digit ? '#F0F7F0' : '#fff',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              style={styles.submitBtn(loading)}
            >
              {loading ? <span style={styles.loadingSpinner} /> : '✅ Verify'}
            </button>

            {resendMsg && (
              <p style={{ textAlign: 'center', fontSize: 13, color: resendMsg.startsWith('✅') ? '#16A34A' : '#DC2626', margin: '8px 0 0' }}>
                {resendMsg}
              </p>
            )}

            <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 16 }}>
              Didn't receive OTP?{' '}
              <span
                onClick={handleResendOtp}
                style={{
                  color: resendCooldown > 0 ? '#9CA3AF' : '#2D7A47',
                  fontWeight: 700,
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                }}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
              </span>
            </p>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 8 }}>
              <span
                onClick={() => { setMode('register'); setError(null) }}
                style={{ color: '#2D7A47', fontWeight: 700, cursor: 'pointer' }}
              >
                ← Go back
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Login / Register Screen ───────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.bgLeaf1}>🌿</div>
      <div style={styles.bgLeaf2}>🌾</div>
      <div style={styles.bgBlur1} />
      <div style={styles.bgBlur2} />

      <div style={styles.card}>
        <div style={styles.cardTop} />
        <div style={styles.cardInner}>
          <div style={styles.brand}>
            <div style={styles.logoWrapper}>
              <span style={styles.logoIcon}>🌾</span>
            </div>
            <h1 style={styles.brandTitle}>Kisan<span style={styles.brandAccent}>AI</span></h1>
            <p style={styles.brandSub}>Smart Farming Assistant</p>
          </div>

          <div style={styles.toggleWrapper}>
            <button
              onClick={() => switchMode('login')}
              style={{
                ...styles.toggleBtn,
                background: mode === 'login' ? 'linear-gradient(135deg, #1B4D2E, #2D7A47)' : 'transparent',
                color: mode === 'login' ? 'white' : '#5A8A6A',
                boxShadow: mode === 'login' ? '0 4px 12px rgba(27,77,46,0.3)' : 'none',
              }}
            >
              <span style={{ marginRight: 6 }}>🔑</span> Login
            </button>
            <button
              onClick={() => switchMode('register')}
              style={{
                ...styles.toggleBtn,
                background: mode === 'register' ? 'linear-gradient(135deg, #1B4D2E, #2D7A47)' : 'transparent',
                color: mode === 'register' ? 'white' : '#5A8A6A',
                boxShadow: mode === 'register' ? '0 4px 12px rgba(27,77,46,0.3)' : 'none',
              }}
            >
              <span style={{ marginRight: 6 }}>✨</span> Register
            </button>
          </div>

          {error && (
            <div style={styles.alert}>
              <span style={styles.alertIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div style={styles.form}>
            {mode === 'register' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>👤</span>
                  <input
                    style={inputStyle(errors.name)}
                    placeholder="e.g., Ali Hamza"
                    value={form.name}
                    maxLength={50}
                    onChange={e => set('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                  />
                </div>
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                <CharCount current={form.name.length} max={50} />
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  style={inputStyle(errors.email)}
                  placeholder="username@gmail.com"
                  type="email"
                  value={form.email}
                  maxLength={100}
                  onChange={e => set('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                />
              </div>
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            {mode === 'register' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number (Optional)</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>📞</span>
                  <input
                    style={inputStyle(errors.phone)}
                    placeholder="0300-1234567"
                    type="tel"
                    value={form.phone}
                    onChange={e => setPhone(e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    maxLength={12}
                  />
                </div>
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  style={{ ...inputStyle(errors.password), paddingRight: 44 }}
                  placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  maxLength={72}
                  onChange={e => set('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
              {mode === 'register' && strength && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBar}>
                    <div style={{ ...styles.strengthFill, width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strength.color }}>Strength: {strength.label}</span>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔐</span>
                  <input
                    style={{ ...inputStyle(errors.confirmPassword), paddingRight: 44 }}
                    placeholder="Re-enter your password"
                    type={showPass2 ? 'text' : 'password'}
                    value={form.confirmPassword}
                    maxLength={72}
                    onChange={e => set('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                  />
                  <button onClick={() => setShowPass2(!showPass2)} style={styles.eyeBtn}>
                    {showPass2 ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
              </div>
            )}

            {mode === 'register' && (
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>City / District</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>📍</span>
                    <input
                      style={inputStyle(errors.city)}
                      placeholder="e.g., Lahore"
                      value={form.city}
                      maxLength={50}
                      onChange={e => set('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                    />
                  </div>
                  {errors.city && <span style={styles.errorText}>{errors.city}</span>}
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Main Crop</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>🌾</span>
                    <select style={inputStyle()} value={form.fasal_type} onChange={e => set('fasal_type', e.target.value)}>
                      <option value="">-- Select --</option>
                      {cropOptions.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div style={styles.forgotRow}>
                <span onClick={() => navigate('/forgot-password')} style={styles.forgotLink}>
                  Forgot password?
                </span>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn(loading)}>
              {loading ? (
                <span style={styles.loadingSpinner} />
              ) : mode === 'login' ? (
                <>🔑 Login</>
              ) : (
                <>🌱 Create Account</>
              )}
            </button>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Google Button */}
            <div style={styles.googleWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                theme="outline"
                shape="pill"
                size="large"
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
                width="100%"
              />
            </div>

            <p style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} style={styles.switchLink}>
                {mode === 'login' ? 'Register now' : 'Login here'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CharCount({ current, max }) {
  const near = current > max * 0.8
  return (
    <div style={{ fontSize: 10, color: near ? '#F59E0B' : '#bbb', textAlign: 'right', marginTop: 4 }}>
      {current}/{max}
    </div>
  )
}

function inputStyle(error) {
  return {
    width: '100%',
    padding: '12px 14px 12px 40px',
    borderRadius: 14,
    border: `1.5px solid ${error ? '#FCA5A5' : '#E2E8F0'}`,
    background: error ? '#FFF5F5' : '#FFFFFF',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    color: '#1a1a1a',
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #0A1F10 0%, #1B4D2E 50%, #2D7A47 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    overflow: 'hidden',
  },
  bgLeaf1: {
    position: 'absolute', top: '5%', left: '3%',
    fontSize: 120, opacity: 0.08, transform: 'rotate(-15deg)', pointerEvents: 'none',
  },
  bgLeaf2: {
    position: 'absolute', bottom: '8%', right: '2%',
    fontSize: 100, opacity: 0.08, transform: 'rotate(10deg)', pointerEvents: 'none',
  },
  bgBlur1: {
    position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%',
    background: 'radial-gradient(circle, rgba(134,212,160,0.15) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  bgBlur2: {
    position: 'absolute', bottom: '-20%', left: '-10%', width: '50%', height: '50%',
    background: 'radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: 500,
    background: 'rgba(255,255,255,0.98)',
    borderRadius: 40,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  cardTop: {
    height: 6,
    background: 'linear-gradient(90deg, #1B4D2E, #2D7A47, #86D4A0, #2D7A47, #1B4D2E)',
  },
  cardInner: { padding: '32px 36px 40px' },
  brand: { textAlign: 'center', marginBottom: 32 },
  logoWrapper: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 70, height: 70,
    background: 'linear-gradient(135deg, #1B4D2E, #2D7A47)',
    borderRadius: 24, marginBottom: 16,
    boxShadow: '0 10px 25px -5px rgba(27,77,46,0.4)',
  },
  logoIcon: { fontSize: 40 },
  brandTitle: { fontSize: 28, fontWeight: 800, margin: 0, color: '#1B4D2E', letterSpacing: -0.5 },
  brandAccent: {
    background: 'linear-gradient(135deg, #2D7A47, #86D4A0)',
    backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
  },
  brandSub: { fontSize: 13, color: '#6B7280', marginTop: 6, fontWeight: 500 },
  toggleWrapper: {
    display: 'flex', background: '#F3F4F6', borderRadius: 60,
    padding: 4, marginBottom: 28, gap: 4,
  },
  toggleBtn: {
    flex: 1, padding: '10px 0', borderRadius: 60, border: 'none',
    cursor: 'pointer', fontWeight: 700, fontSize: 14,
    transition: 'all 0.2s ease', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  alert: {
    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16,
    padding: '12px 16px', marginBottom: 24,
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 13, color: '#DC2626', fontWeight: 500,
  },
  alertIcon: { fontSize: 16 },
  otpInfo: {
    textAlign: 'center', background: '#F0F7F0', borderRadius: 16,
    padding: '20px', marginBottom: 24,
  },
  otpBoxRow: {
    display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24,
  },
  otpBox: {
    width: 48, height: 56, borderRadius: 14,
    border: '2px solid #E2E8F0',
    fontSize: 24, fontWeight: 800, textAlign: 'center',
    outline: 'none', transition: 'all 0.2s', color: '#1B4D2E',
    fontFamily: 'inherit',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginLeft: 4 },
  inputWrapper: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
    fontSize: 16, color: '#9CA3AF', pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9CA3AF', padding: 0,
  },
  errorText: { fontSize: 11, color: '#DC2626', marginLeft: 4 },
  strengthContainer: { marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 },
  strengthBar: { flex: 1, height: 4, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  strengthLabel: { fontSize: 11, fontWeight: 600 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  forgotRow: { textAlign: 'right', marginTop: -8 },
  forgotLink: { fontSize: 12, color: '#2D7A47', fontWeight: 600, cursor: 'pointer' },
  submitBtn: (loading) => ({
    width: '100%', padding: '14px', borderRadius: 40, border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    background: 'linear-gradient(135deg, #1B4D2E, #2D7A47)',
    color: 'white', fontSize: 15, fontWeight: 700,
    boxShadow: loading ? 'none' : '0 8px 20px rgba(27,77,46,0.35)',
    transition: 'all 0.2s', fontFamily: 'inherit', marginTop: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: loading ? 0.7 : 1,
  }),
  loadingSpinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' },
  dividerLine: { flex: 1, height: 1, background: '#E5E7EB' },
  dividerText: { fontSize: 12, color: '#9CA3AF', fontWeight: 500 },
  googleWrapper: { display: 'flex', justifyContent: 'center' },
  switchText: { textAlign: 'center', fontSize: 13, color: '#6B7280', margin: '8px 0 0' },
  switchLink: { color: '#2D7A47', fontWeight: 700, cursor: 'pointer' },
}

const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
`
document.head.appendChild(styleSheet)