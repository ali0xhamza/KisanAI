// src/components/FeedbackSection.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Stars component ────────────────────────────────────────────
function Stars({ rating, size = 18, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            fontSize: size,
            cursor: interactive ? 'pointer' : 'default',
            color: s <= (hovered || rating) ? '#f59e0b' : '#cbd5e1',
            transition: 'all 0.15s ease',
            transform: interactive && s <= hovered ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
          }}
        >★</span>
      ))}
    </div>
  )
}

// ── Rating distribution bar ────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 12, color: '#4a7c59', width: 12, textAlign: 'right' }}>{star}</span>
      <span style={{ fontSize: 12, color: '#f59e0b' }}>★</span>
      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: 4, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: '#6b7280', width: 28 }}>{count}</span>
    </div>
  )
}

// ── Submit / Edit Modal ────────────────────────────────────────
function SubmitModal({ onClose, onSuccess, existing }) {
  const token = localStorage.getItem('kisan_token')
  const [rating, setRating] = useState(existing?.rating || 0)
  const [review, setReview] = useState(existing?.review || '')
  const [city, setCity] = useState(existing?.city || '')
  const [crop, setCrop] = useState(existing?.crop || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!rating) return setError('Please give a rating from 1 to 5 stars')
    if (review.trim().length < 10) return setError('Please write a slightly longer review (at least 10 characters)')
    setLoading(true); setError('')
    try {
      const res = await axios.post(
        `${API}/api/feedback/`,
        { rating, review, city, crop },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onSuccess(res.data?.action === 'updated')
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      backdropFilter: 'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'white', borderRadius: 28, padding: '32px 28px',
        width: '100%', maxWidth: 440, boxShadow: '0 24px 72px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#1B4D2E' }}>{existing ? 'Update Review' : 'Share Your Experience'}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{existing ? 'Edit your previous review' : 'Help other farmers'}</div>
          </div>
          <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, color: '#666' }}>✕</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 10, fontWeight: 600 }}>
            {['', 'Very bad', 'It was okay', 'It was good', 'Very good', 'Excellent! 🎉'][rating] || 'Rate your experience'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Stars rating={rating} size={36} interactive onRate={setRating} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#1B4D2E', display: 'block', marginBottom: 6 }}>Write Your Experience *</label>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="How did KisanAI help you? Which feature did you like the most?"
            rows={3}
            maxLength={500}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #C8EDD6', background: '#F8FFF8', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: '#aaa', marginTop: 2 }}>{review.length}/500</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#1B4D2E', display: 'block', marginBottom: 6 }}>City (Optional)</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Lahore" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #C8EDD6', background: '#F8FFF8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#1B4D2E', display: 'block', marginBottom: 6 }}>Crop (Optional)</label>
            <input type="text" value={crop} onChange={e => setCrop(e.target.value)} placeholder="e.g. Wheat, Rice..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #C8EDD6', background: '#F8FFF8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 10, padding: '10px 14px', color: '#CC0000', fontSize: 13, marginBottom: 14 }}>❌ {error}</div>}

        <button onClick={submit} disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: loading ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {loading ? 'Submitting...' : existing ? '✏️ Update Review' : '⭐ Submit Review'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 12 }}>
          ✅ Your review is now visible to everyone
        </div>
      </div>
    </div>
  )
}

// ── Main Section (green background + pagination) ───────────────
export default function FeedbackSection() {
  const { isLoggedIn, token } = useAuth()
  const [data, setData] = useState(null)           // stats + total
  const [myReview, setMyReview] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [reviews, setReviews] = useState([])

  const LIMIT = 6

  useEffect(() => {
    fetchInitialStats()
    fetchPageReviews(1)
  }, [])

  useEffect(() => {
    if (isLoggedIn && token) fetchMyReview()
  }, [token])

  async function fetchInitialStats() {
    try {
      const res = await axios.get(`${API}/api/feedback/?limit=1&offset=0`)
      setData(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function fetchPageReviews(page) {
    const offset = (page - 1) * LIMIT
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/feedback/?limit=${LIMIT}&offset=${offset}`)
      setReviews(res.data.reviews || [])
      setData(prev => prev ? prev : res.data)
      setCurrentPage(page)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function fetchMyReview() {
    try {
      const res = await axios.get(`${API}/api/feedback/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyReview(res.data || null)
    } catch (e) {
      if (e.response?.status === 404) setMyReview(null)
    }
  }

  function handleSuccess(isEdit = false) {
    setShowModal(false)
    setSubmitted(isEdit ? 'edited' : true)
    fetchInitialStats()
    fetchPageReviews(currentPage)
    fetchMyReview()
    // auto‑hide success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000)
  }

  const stats = data?.stats
  const totalPages = stats ? Math.ceil(stats.total / LIMIT) : 0

  return (
    <section style={{
      background: '#F9F6F0',
      padding: '80px 20px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block',
            background: '#1B4D2E',
            color: '#E8B86D',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            padding: '6px 18px',
            borderRadius: 40,
            textTransform: 'uppercase',
          }}>⭐ Farmer Stories</span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            color: '#0d2e14',
            margin: '20px 0 8px',
            letterSpacing: -0.5,
          }}>
            Real Reviews — Real Farmers
          </h2>
          <p style={{ fontSize: 15, color: '#4a7c59', maxWidth: 500, margin: '0 auto' }}>
            Hear what farmers across Pakistan are saying about KisanAI
          </p>
        </div>

        {/* Stats + Distribution */}
        {stats && stats.total > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'center',
            gap: 40,
            background: 'white',
            borderRadius: 32,
            padding: '28px 36px',
            maxWidth: 560,
            margin: '0 auto 48px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: '#1B4D2E', lineHeight: 1 }}>{stats.avg_rating}</div>
              <div style={{ marginTop: 8 }}><Stars rating={Math.round(stats.avg_rating)} size={16} /></div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{stats.total} reviews</div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              {[5,4,3,2,1].map(s => (
                <RatingBar key={s} star={s} count={stats.distribution?.[String(s)] || 0} total={stats.total} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: 'white', borderRadius: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <div>No reviews yet — be the first to share your experience!</div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
              marginBottom: 48,
            }}>
              {reviews.map((r, i) => (
                <div key={r.id} style={{
                  background: 'white',
                  borderRadius: 24,
                  padding: '28px 24px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E8F4E8',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Stars rating={r.rating} size={16} />
                    <span style={{ fontSize: 11, color: '#aaa' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 14,
                    color: '#374151',
                    lineHeight: 1.75,
                    margin: '0 0 20px',
                    fontStyle: 'italic',
                  }}>“{r.review}”</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#2d8a45,#4caf65)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: 'white',
                      flexShrink: 0,
                    }}>
                      {r.user_name?.[0] || '👤'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>{r.user_name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {[r.city, r.crop ? `${r.crop} Farmer` : ''].filter(Boolean).join(' · ') || 'KisanAI User'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
                <button
                  onClick={() => fetchPageReviews(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 40,
                    background: currentPage === 1 ? '#E5E7EB' : '#1B4D2E',
                    border: 'none',
                    color: currentPage === 1 ? '#9CA3AF' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.background = '#2D7A47' }}
                  onMouseLeave={e => { if (currentPage !== 1) e.currentTarget.style.background = '#1B4D2E' }}
                >
                  ◀ Previous
                </button>
                <span style={{ fontSize: 14, color: '#1B4D2E', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchPageReviews(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 40,
                    background: currentPage === totalPages ? '#E5E7EB' : '#1B4D2E',
                    border: 'none',
                    color: currentPage === totalPages ? '#9CA3AF' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (currentPage !== totalPages) e.currentTarget.style.background = '#2D7A47' }}
                  onMouseLeave={e => { if (currentPage !== totalPages) e.currentTarget.style.background = '#1B4D2E' }}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA – Submit / Edit Review */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          {submitted ? (
            <div style={{
              display: 'inline-block',
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              borderRadius: 24,
              padding: '20px 32px',
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div style={{ color: '#15803D', fontWeight: 700, fontSize: 16 }}>
                {submitted === 'edited' ? '✏️ Review updated!' : 'Thank you! Review submitted'}
              </div>
              <div style={{ color: '#166534', fontSize: 12, marginTop: 6 }}>Your review is now visible to everyone</div>
            </div>
          ) : myReview ? (
            <div>
              <div style={{
                display: 'inline-block',
                background: 'white',
                border: '1px solid #C8EDD6',
                borderRadius: 24,
                padding: '20px 32px',
                marginBottom: 20,
              }}>
                <div style={{ marginBottom: 8 }}><Stars rating={myReview.rating} size={20} /></div>
                <p style={{ fontSize: 14, color: '#374151', margin: '0 0 6px', fontStyle: 'italic' }}>“{myReview.review}”</p>
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>✅ Your review is visible</div>
              </div>
              <br />
              <button onClick={() => setShowModal(true)}
                style={{
                  background: 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: 40,
                  fontWeight: 600,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                ✏️ Edit Review
              </button>
            </div>
          ) : !isLoggedIn ? (
            <div>
              <p style={{ color: '#4a7c59', marginBottom: 16 }}>Please log in to submit a review</p>
              <a href="/auth" style={{
                background: 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                color: 'white',
                padding: '14px 32px',
                borderRadius: 50,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}>🔑 Log in</a>
            </div>
          ) : (
            <button onClick={() => setShowModal(true)}
              style={{
                background: 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                color: 'white',
                padding: '16px 44px',
                borderRadius: 50,
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(27,77,46,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,77,46,0.45)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,77,46,0.3)'
              }}
            >
              ⭐ Submit Your Review
            </button>
          )}
        </div>
      </div>

      {showModal && <SubmitModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} existing={myReview} />}
    </section>
  )
}