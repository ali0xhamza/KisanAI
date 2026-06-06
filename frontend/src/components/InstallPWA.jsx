// src/components/InstallPWA.jsx
import { useState, useEffect } from 'react'

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showBanner, setShowBanner]       = useState(false)
  const [installed, setInstalled]         = useState(false)

  useEffect(() => {
    // Is it already installed?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Capture the browser install prompt
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      // Show the banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShowBanner(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShowBanner(false)
    }
    setInstallPrompt(null)
  }

  if (installed || !showBanner || !installPrompt) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '16px',
      right: '16px',
      background: 'linear-gradient(135deg, #1B4D2E, #2D7A47)',
      borderRadius: '16px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 9998,
      border: '1px solid rgba(255,255,255,0.15)',
    }}>
      <div style={{ fontSize: '36px' }}>🌾</div>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
          Install KisanAI
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>
          It will also work offline!
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          style={{
            padding: '8px 16px',
            background: 'white',
            color: '#1B4D2E',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Install ✓
        </button>
      </div>
    </div>
  )
}