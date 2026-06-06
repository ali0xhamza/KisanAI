import { useState, useEffect } from 'react'

const BACKEND  = import.meta.env.VITE_API_URL       || 'http://localhost:8000'
const VAPID_PK = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64) {
  const pad  = '='.repeat((4 - base64.length % 4) % 4)
  const b64  = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw  = window.atob(b64)
  const arr  = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function usePushNotification() {
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  )
  const [subscribed, setSubscribed] = useState(
    localStorage.getItem('push_subscribed') === 'true'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('Push notifications are not supported in this browser')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setError('Permission denied — please allow it from browser settings')
        return
      }

      const reg = await navigator.serviceWorker.ready

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PK),
      })

      const token = localStorage.getItem('kisan_token') || ''
      await fetch(`${BACKEND}/api/notifications/subscribe`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sub.toJSON()),
      })

      setSubscribed(true)
      localStorage.setItem('push_subscribed', 'true')
    } catch (e) {
      setError('Notification setup failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      for (const reg of regs) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
      }
      setSubscribed(false)
      localStorage.removeItem('push_subscribed')
    } catch (e) {
      setError('Failed to unsubscribe: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return { permission, subscribed, loading, error, subscribe, unsubscribe }
}