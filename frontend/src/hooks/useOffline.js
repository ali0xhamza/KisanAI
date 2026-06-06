import { useState, useEffect } from 'react'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  )

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  return isOffline
}

// safe cache save
export function saveToCache(key, data) {
  try {
    if (typeof localStorage === "undefined") return

    localStorage.setItem(`kisan_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('Failed to save cache:', e)
  }
}

// safe cache read
export function getFromCache(key, maxAgeMs = 86400000) {
  try {
    if (typeof localStorage === "undefined") return null

    const stored = localStorage.getItem(`kisan_cache_${key}`)
    if (!stored) return null

    const { data, timestamp } = JSON.parse(stored)
    if (Date.now() - timestamp > maxAgeMs) {
      localStorage.removeItem(`kisan_cache_${key}`)
      return null
    }

    return data
  } catch {
    return null
  }
}