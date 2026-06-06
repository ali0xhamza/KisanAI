// src/pages/ChatHistory.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ChatHistory() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return }
    fetchHistory()
  }, [isLoggedIn])

  async function fetchHistory() {
    setLoading(true)
    try {
      const data = await chatAPI.getHistory()
      setHistory(data)
    } catch {
      setError('Could not load history')
    } finally {
      setLoading(false)
    }
  }

  const filtered = history.filter(h =>
    h.message?.toLowerCase().includes(search.toLowerCase()) ||
    h.response?.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('ur-PK', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'52px 20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>💬</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Chat History</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>Your past conversations</div>
          </div>
          <button onClick={() => navigate('/chat')} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'8px 14px', color:'white', fontSize:12, cursor:'pointer', fontWeight:600 }}>
            ➕ New Chat
          </button>
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* Not logged in */}
        {!isLoggedIn && (
          <div style={{ textAlign:'center', padding:'40px 20px', background:'white', borderRadius:18 }}>
            <div style={{ fontSize:48 }}>🔐</div>
            <div style={{ fontWeight:700, fontSize:16, color:'#1B4D2E', marginTop:12 }}>Login Required</div>
            <div style={{ color:'#888', fontSize:13, marginTop:8, marginBottom:20 }}>You need to log in to view chat history</div>
            <button onClick={() => navigate('/auth')} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Login / Register
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoggedIn && loading && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ width:40, height:40, border:'3px solid #C8EDD6', borderTop:'3px solid #1B4D2E', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }} />
            <p style={{ color:'#888', marginTop:12 }}>Loading history...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'12px 16px', color:'#CC0000', fontSize:13, marginBottom:14 }}>
            ❌ {error}
          </div>
        )}

        {/* Content */}
        {isLoggedIn && !loading && (
          <>
            {/* Search */}
            {history.length > 0 && (
              <input
                placeholder="🔍 Search in chat history..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'white', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', marginBottom:14 }}
              />
            )}

            {/* Empty */}
            {history.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', background:'white', borderRadius:18 }}>
                <div style={{ fontSize:48 }}>📭</div>
                <div style={{ fontWeight:700, fontSize:16, color:'#1B4D2E', marginTop:12 }}>No chats yet</div>
                <div style={{ color:'#888', fontSize:13, marginTop:8, marginBottom:20 }}>Talk to the AI chatbot — history will be saved here</div>
                <button onClick={() => navigate('/chat')} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  🌾 Start Chat
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:13, color:'#888', marginBottom:12, fontWeight:600 }}>
                  {filtered.length} conversations
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {filtered.map((item, i) => (
                    <div key={item.id || i} style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #E8F4E8' }}>

                      {/* Question */}
                      <div
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        style={{ padding:'14px 16px', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:10 }}
                      >
                        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#2D7A47,#86D4A0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>👤</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace: expanded === i ? 'normal' : 'nowrap' }}>
                            {item.message}
                          </div>
                          <div style={{ fontSize:11, color:'#bbb', marginTop:3 }}>{formatDate(item.created_at)}</div>
                        </div>
                        <div style={{ color:'#C8EDD6', fontSize:16, flexShrink:0 }}>{expanded === i ? '▲' : '▼'}</div>
                      </div>

                      {/* Answer — expanded */}
                      {expanded === i && (
                        <div style={{ borderTop:'1px solid #F0F7F0', padding:'14px 16px', background:'#F8FFF8' }}>
                          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                            <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🌾</div>
                            <div style={{ fontSize:13, lineHeight:1.7, color:'#1a1a1a', whiteSpace:'pre-wrap' }}>
                              {item.response}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}