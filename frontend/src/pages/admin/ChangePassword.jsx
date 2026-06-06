// frontend/src/components/admin/ChangePassword.jsx
// Admin panel mein is component ko import karke use karo

import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ChangePassword() {
  const { token } = useAuth()

  const [form, setForm] = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  })
  const [show, setShow]       = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const strength = (p) => {
    if (!p) return { label: '', color: '#e5e7eb', width: '0%' }
    if (p.length < 6)  return { label: 'Too Short', color: '#ef4444', width: '25%' }
    if (p.length < 8)  return { label: 'Weak',      color: '#f97316', width: '50%' }
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p))
                       return { label: 'Medium',    color: '#eab308', width: '75%' }
    return               { label: 'Strong',     color: '#22c55e', width: '100%' }
  }

  const pwd = strength(form.new_password)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async () => {
    if (!form.current_password) { setError('Please enter your current password'); return }
    if (!form.new_password)     { setError('Please enter a new password');         return }
    if (form.new_password.length < 8) { setError('New password must be at least 8 characters'); return }
    if (form.new_password !== form.confirm_password) { setError('Passwords do not match'); return }

    setLoading(true)
    setError('')
    try {
      await axios.post(
        `${API}/api/admin/change-password`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(true)
      setForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0A1F10,#1B4D2E)', borderRadius: 20, padding: '24px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Change Admin Password</div>
        <div style={{ color: '#86D4A0', fontSize: 13, marginTop: 4 }}>Confirm current password before setting a new one</div>
      </div>

      {/* Success */}
      {success && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ color: '#15803D', fontWeight: 700, fontSize: 15 }}>Password Changed Successfully!</div>
          <div style={{ color: '#166534', fontSize: 13, marginTop: 4 }}>A confirmation email has been sent to your inbox.</div>
        </div>
      )}

      {/* Form Card */}
      <div style={{ background: 'white', borderRadius: 18, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        {/* Current Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Current Password</label>
          <div style={inputWrap}>
            <input
              name="current_password"
              type={show.current ? 'text' : 'password'}
              value={form.current_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              style={inputStyle}
            />
            <button onClick={() => setShow(s => ({ ...s, current: !s.current }))} style={eyeBtn}>
              {show.current ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #e5e7eb', margin: '16px 0' }} />

        {/* New Password */}
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>New Password</label>
          <div style={inputWrap}>
            <input
              name="new_password"
              type={show.new ? 'text' : 'password'}
              value={form.new_password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              style={inputStyle}
            />
            <button onClick={() => setShow(s => ({ ...s, new: !s.new }))} style={eyeBtn}>
              {show.new ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Strength bar */}
          {form.new_password && (
            <div style={{ marginTop: 6 }}>
              <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pwd.width, background: pwd.color, borderRadius: 2, transition: 'all 0.3s' }} />
              </div>
              <div style={{ fontSize: 11, color: pwd.color, fontWeight: 600, marginTop: 4 }}>{pwd.label}</div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Confirm New Password</label>
          <div style={inputWrap}>
            <input
              name="confirm_password"
              type={show.confirm ? 'text' : 'password'}
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Re-enter new password"
              style={{
                ...inputStyle,
                borderColor: form.confirm_password
                  ? form.confirm_password === form.new_password ? '#22c55e' : '#ef4444'
                  : '#C8EDD6'
              }}
            />
            <button onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} style={eyeBtn}>
              {show.confirm ? '🙈' : '👁️'}
            </button>
          </div>
          {form.confirm_password && form.confirm_password !== form.new_password && (
            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>⚠️ Passwords do not match</div>
          )}
          {form.confirm_password && form.confirm_password === form.new_password && (
            <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>✓ Passwords match</div>
          )}
        </div>

        {/* Tips */}
        <div style={{ background: '#F0F7F0', borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#1B4D2E', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>💡 Strong password tips:</div>
          <div>• At least 8 characters long</div>
          <div>• Include uppercase letters (A-Z)</div>
          <div>• Include numbers (0-9)</div>
          <div>• Include symbols (!@#$)</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 10, padding: '10px 14px', color: '#CC0000', fontSize: 13, marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: loading ? '#9ca3af' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
            color: 'white', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          {loading
            ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Changing...</>
            : '🔐 Change Password'
          }
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#1B4D2E', marginBottom: 8 }
const inputWrap  = { position: 'relative' }
const inputStyle = { display: 'block', width: '100%', padding: '11px 40px 11px 14px', borderRadius: 12, border: '1.5px solid #C8EDD6', background: '#F8FFF8', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const eyeBtn     = { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 }