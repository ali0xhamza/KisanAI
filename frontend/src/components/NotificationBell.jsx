import { useState } from 'react'
import { usePushNotification } from '../hooks/usePushNotification'
import { useTranslation } from 'react-i18next'

export default function NotificationBell() {
  const { i18n }                                          = useTranslation()
  const ur                                                = i18n.language === 'ur'
  const { permission, subscribed, loading, error,
          subscribe, unsubscribe }                        = usePushNotification()
  const [open, setOpen]                                   = useState(false)

  const statusColor = subscribed ? '#16a34a' : '#94a3b8'

  return (
    <div style={{ position: 'relative' }}>

      {/* Bell Button */}
      <button onClick={() => setOpen(p => !p)} style={{
        width: 38, height: 38, borderRadius: '50%',
        border: `2px solid ${statusColor}`,
        background: subscribed ? '#f0fdf4' : '#f8fafc',
        cursor: 'pointer', fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        🔔
        {subscribed && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 10, height: 10, borderRadius: '50%',
            background: '#16a34a', border: '2px solid white',
          }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notif-dropdown-mobile" style={{
          position: 'absolute', top: 46, right: 0,
          width: 260, background: 'white',
          borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e2e8f0', padding: 16, zIndex: 9999,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0d2e14', marginBottom: 4 }}>
            🔔 {ur ? 'اطلاعات' : 'Notifications'}
          </div>

          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            {subscribed
              ? (ur ? '✅ اطلاعات چالو ہیں' : '✅ Notifications are ON')
              : (ur ? '❌ اطلاعات بند ہیں' : '❌ Notifications are OFF')}
          </div>

          {/* What notifications */}
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 6 }}>
              {ur ? 'کن چیزوں کی اطلاع ملے گی:' : 'What alerts will you get:'}
            </div>
            {[
              ['💰', ur ? 'منڈی بھاؤ میں بڑی تبدیلی' : 'Mandi price big Major market price changes'],
              ['🌧️', ur ? 'موسم کی وارننگ' : 'Weather alerts'],
              ['💊', ur ? 'سپرے کا وقت' : 'Spray reminders'],
              ['🌱', ur ? 'فصل کی تجاویز' : 'Crop tips'],
            ].map(([icon, text]) => (
              <div key={text} style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>
                {icon} {text}
              </div>
            ))}
          </div>

          {error && (
            <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={subscribed ? unsubscribe : subscribe}
            disabled={loading}
            style={{
              width: '100%', padding: '10px',
              borderRadius: 10, border: 'none',
              background: subscribed
                ? '#fef2f2' : 'linear-gradient(135deg,#15803d,#22c55e)',
              color: subscribed ? '#dc2626' : 'white',
              fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? (ur ? '⏳ انتظار...' : '⏳ Please wait...')
              : subscribed
                ? (ur ? '🔕 بند کریں' : '🔕 Turn Off')
                : (ur ? '🔔 اطلاعات چالو کریں' : '🔔 Turn On Notifications')}
          </button>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9998,
        }} />
      )}
    </div>
  )
}