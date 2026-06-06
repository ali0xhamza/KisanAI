import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../services/api'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const QUICK = [
  '🌿 Are there spots on tomato leaves?',
  '🌾 Which fertilizer should I use for wheat?',
  '💧 How can I test soil pH?',
  '🌦️ What should I do before rain?',
  '🐛 How can I protect crops from pests?',
]

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom:12, alignItems:'flex-end', gap:8 }}>
      {!isUser && (
        <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌾</div>
      )}
      <div style={{
        maxWidth:'75%', padding:'12px 16px', fontSize:14, lineHeight:1.6,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : 'white',
        color: isUser ? 'white' : '#1a1a1a',
        boxShadow: isUser ? '0 4px 14px rgba(27,77,46,0.35)' : '0 2px 12px rgba(0,0,0,0.08)',
        border: isUser ? 'none' : '1px solid #E8F4E8', whiteSpace:'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
        <div style={{ fontSize:10, marginTop:4, opacity:0.6, textAlign: isUser ? 'right' : 'left' }}>
          {new Date().toLocaleTimeString('ur-PK', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
      {isUser && (
        <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#2D7A47,#86D4A0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
          {msg.isVoice ? '🎙️' : '👤'}
        </div>
      )}
    </div>
  )
}

function TypingBubble() {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:12 }}>
      <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌾</div>
      <div style={{ padding:'14px 18px', background:'white', borderRadius:'18px 18px 18px 4px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', border:'1px solid #E8F4E8', display:'flex', gap:5, alignItems:'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#86D4A0', animation:'bounce 1.2s infinite', animationDelay:`${i*0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

export default function Chatbot() {
  const { user, isLoggedIn } = useAuth()
  const [messages, setMessages]   = useState([
    { role:'assistant', content:'Assalam o Alaikum! 🌾 I am KisanAI — your AI farming expert.\nAsk me anything using voice or text — I\'m here to help with your farming questions.' }
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking]   = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [voiceSupported]          = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const bottomRef      = useRef(null)
  const textareaRef    = useRef(null)
  const recognitionRef = useRef(null)
  const resumeRef      = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
    return () => stopSpeaking()
  }, [])

  function speakText(text) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (resumeRef.current) clearInterval(resumeRef.current)
    const cleanText = text.replace(/[^\w\s\u0600-\u06FF.,!?]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400)
    if (!cleanText) return
    const trySpeak = () => {
      const utterance = new SpeechSynthesisUtterance(cleanText)
      const voices = window.speechSynthesis.getVoices()
      const urduVoice    = voices.find(v => v.lang === 'ur-PK' || v.lang === 'ur')
      const hindiVoice   = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi')
      const englishVoice = voices.find(v => v.lang.startsWith('en'))
      if (urduVoice)         { utterance.voice = urduVoice;    utterance.lang = 'ur-PK' }
      else if (hindiVoice)   { utterance.voice = hindiVoice;   utterance.lang = 'hi-IN' }
      else if (englishVoice) { utterance.voice = englishVoice; utterance.lang = 'en-US' }
      else                   { utterance.lang = 'ur-PK' }
      utterance.rate = 0.85; utterance.pitch = 1.0; utterance.volume = 1.0
      utterance.onstart = () => {
        setSpeaking(true)
        resumeRef.current = setInterval(() => {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume()
          if (!window.speechSynthesis.speaking) clearInterval(resumeRef.current)
        }, 500)
      }
      utterance.onend = () => { setSpeaking(false); if (resumeRef.current) clearInterval(resumeRef.current) }
      utterance.onerror = () => { setSpeaking(false); if (resumeRef.current) clearInterval(resumeRef.current) }
      window.speechSynthesis.speak(utterance)
    }
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) setTimeout(trySpeak, 200)
    else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; setTimeout(trySpeak, 200) } }
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel()
    if (resumeRef.current) clearInterval(resumeRef.current)
    setSpeaking(false)
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    stopSpeaking()
    const recognition = new SpeechRecognition()
    recognition.lang = 'ur-PK'; recognition.interimResults = false; recognition.maxAlternatives = 3; recognition.continuous = false
    recognition.onstart  = () => { setListening(true); setVoiceMode(true) }
    recognition.onresult = (event) => { const t = event.results[0][0].transcript; setInput(t); setListening(false); setTimeout(() => sendMessage(t, true), 300) }
    recognition.onerror  = () => { setListening(false); setVoiceMode(false) }
    recognition.onend    = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  async function saveChatLog(message, response) {
    if (!isLoggedIn) return
    try { await api.post('/api/chat/save', { message, response }) } catch {}
  }

  const sendMessage = async (text, isVoiceInput = false) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = '46px'
    const newMessages = [...messages, { role:'user', content:q, isVoice: isVoiceInput }]
    setMessages(newMessages)
    setLoading(true)
    stopSpeaking()
    try {
      const reply = await aiAPI.chat(newMessages.map(m => ({ role: m.role, content: m.content })))
      setMessages(prev => [...prev, { role:'assistant', content:reply }])
      if (isVoiceInput) setTimeout(() => speakText(reply), 300)
      await saveChatLog(q, reply)
    } catch (err) {
      if (err.response?.status === 401) {
        setMessages(prev => [...prev, { role:'assistant', content:'Please log in to save chat history!' }])
      } else {
        setMessages(prev => [...prev, { role:'assistant', content:'Something went wrong — please try again!' }])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#F0F7F0' }}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
        @keyframes pulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.8} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        @keyframes wave   { 0%,100%{height:6px} 50%{height:20px} }
        .chat-wrapper { padding-top: 56px !important; }
        @media (min-width: 768px) { .chat-wrapper { padding-top: 0 !important; } }
        .chat-input-wrap { padding-bottom: 28px !important; }
        @media (max-width: 767px) { .chat-input-wrap { padding-bottom: calc(68px + 12px) !important; } }
      `}</style>

      <div className="chat-wrapper" style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'16px 16px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 4px 20px rgba(0,0,0,0.15)', flexShrink:0 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'1px solid rgba(255,255,255,0.2)', flexShrink:0 }}>🌾</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:'white', fontWeight:800, fontSize:16 }}>KisanAI Chat</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#4CAF72', flexShrink:0 }} />
              <span style={{ color:'#86D4A0', fontSize:11, whiteSpace:'nowrap' }}>
                {speaking ? '🔊 Speaking...' : listening ? '🎙️ Listening...' : voiceSupported ? '🎙️ Voice Ready' : 'Online'}
              </span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
            {speaking && (
              <button onClick={stopSpeaking} style={{ background:'rgba(255,100,100,0.2)', border:'1px solid rgba(255,100,100,0.4)', borderRadius:10, padding:'7px 10px', color:'white', fontSize:12, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
                🔇 Stop
              </button>
            )}
            <button
              onClick={() => { setMessages([{ role:'assistant', content:'Assalam o Alaikum! 🌾 New chat started. What is your question?' }]); stopSpeaking(); setVoiceMode(false) }}
              style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'7px 10px', color:'white', fontSize:12, cursor:'pointer', fontWeight:600 }}
            >🗑️</button>
          </div>
        </div>

        {/* Speaking Wave */}
        {speaking && (
          <div style={{ background:'rgba(27,77,46,0.95)', padding:'8px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexShrink:0 }}>
            <div style={{ display:'flex', gap:3, alignItems:'center', height:20 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ width:3, borderRadius:3, background:'#86D4A0', animation:`wave 0.8s ease-in-out infinite`, animationDelay:`${i*0.12}s`, alignSelf:'center' }} />
              ))}
            </div>
            <span style={{ color:'#86D4A0', fontSize:12, fontWeight:600 }}>🔊 KisanAI is speaking...</span>
            <button onClick={stopSpeaking} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:6, padding:'3px 8px', color:'white', fontSize:11, cursor:'pointer' }}>Stop</button>
          </div>
        )}

        {/* Login warning */}
        {!isLoggedIn && (
          <div style={{ background:'#FEF3C7', padding:'8px 16px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid #FDE68A', flexShrink:0 }}>
            <span>⚠️</span>
            <span style={{ fontSize:12, color:'#92400E', fontWeight:600 }}>Please login to save chat history</span>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 12px 8px', WebkitOverflowScrolling:'touch' }}>
          {messages.length <= 1 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#1B4D2E', marginBottom:10 }}>⚡ Quick questions:</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {QUICK.map(q => (
                  <button key={q} onClick={() => sendMessage(q, false)} style={{ background:'white', border:'1.5px solid #C8EDD6', borderRadius:12, padding:'10px 14px', color:'#1B4D2E', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>{q}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {loading && <TypingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Listening indicator */}
        {listening && (
          <div style={{ background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexShrink:0 }}>
            <div style={{ position:'relative', width:18, height:18 }}>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(255,255,255,0.4)', animation:'ripple 1s infinite' }} />
              <div style={{ position:'absolute', inset:3, borderRadius:'50%', background:'white' }} />
            </div>
            <span style={{ color:'white', fontSize:13, fontWeight:600 }}>🎙️ Listening... Please speak!</span>
            <button onClick={stopVoice} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, padding:'3px 10px', color:'white', fontSize:11, cursor:'pointer' }}>Stop</button>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-wrap" style={{ padding:'10px 12px 28px', background:'white', borderTop:'1px solid #E8F4E8', boxShadow:'0 -4px 20px rgba(0,0,0,0.06)', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
            {voiceSupported && (
              <button
                onClick={listening ? stopVoice : startVoice}
                style={{
                  width:44, height:44, borderRadius:12, border:'none', flexShrink:0,
                  background: listening ? 'linear-gradient(135deg,#e53935,#c62828)' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                  color:'white', fontSize:20, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: listening ? '0 4px 14px rgba(229,57,53,0.5)' : '0 4px 14px rgba(27,77,46,0.4)',
                  animation: listening ? 'pulse 1s infinite' : 'none',
                }}
              >{listening ? '⏹️' : '🎙️'}</button>
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                setVoiceMode(false)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input, false) } }}
              placeholder={voiceSupported ? '🎙️ Press mic or type...' : 'Type your question...'}
              style={{ flex:1, padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', resize:'none', fontFamily:'inherit', lineHeight:1.5, minHeight:44, maxHeight:120 }}
            />
            <button
              onClick={() => sendMessage(input, false)}
              disabled={!input.trim() || loading}
              style={{
                width:44, height:44, borderRadius:12, border:'none', flexShrink:0,
                background: (!input.trim() || loading) ? '#E0E0E0' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                color:'white', fontSize:20, cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: (!input.trim() || loading) ? 'none' : '0 4px 14px rgba(27,77,46,0.4)',
                transition:'all 0.2s',
              }}
            >{loading ? '⏳' : '📤'}</button>
          </div>
          <p style={{ textAlign:'center', fontSize:10, color:'#bbb', marginTop:6 }}>
            🎙️ Voice → Voice + Text • ⌨️ Text → Text only • KisanAI 🇵🇰
          </p>
        </div>
      </div>
    </div>
  )
}