// src/components/OfflineBanner.jsx
import { useState, useEffect } from 'react'
import { useOffline } from '../hooks/useOffline'

export default function OfflineBanner() {
  const isOffline = useOffline()
  const [showOnline, setShowOnline] = useState(false)
  const [prevOffline, setPrevOffline] = useState(false)

  useEffect(() => {
    // Was offline, now back online — show "Back online!"
    if (prevOffline && !isOffline) {
      setShowOnline(true)
      const t = setTimeout(() => setShowOnline(false), 3000)
      return () => clearTimeout(t)
    }
    setPrevOffline(isOffline)
  }, [isOffline])

  if (!isOffline && !showOnline) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: '10px 20px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      ...(isOffline ? {
        background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
        color: 'white',
        boxShadow: '0 2px 10px rgba(192,57,43,0.4)',
      } : {
        background: 'linear-gradient(135deg, #1B4D2E, #2D7A47)',
        color: 'white',
        boxShadow: '0 2px 10px rgba(27,77,46,0.4)',
      })
    }}>
      {isOffline ? (
        <>
          <span>📵</span>
          <span> No internet — showing cached data</span>
        </>
      ) : (
        <>
          <span>✅</span>
          <span>Back online! Updating data...</span>
        </>
      )}
    </div>
  )
}