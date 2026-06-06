import { useState, useEffect } from 'react'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CROPS = [
  '🌾 Wheat','🍚 Rice','🌽 Maize','🌿 Cotton','🎋 Sugarcane',
  '🫘 Chickpea','🌻 Mustard','🥭 Mango','🍅 Tomato','🥔 Potato','🍌 Banana',
]

const ACTIVITIES = [
  { value:'boai',     label:'بوائی',   en:'Sowing',        icon:'🌱' },
  { value:'sinchaii', label:'سینچائی', en:'Irrigation',    icon:'💧' },
  { value:'spray',    label:'سپرے',    en:'Spray',         icon:'💊' },
  { value:'khad',     label:'کھاد',    en:'Fertilizer',    icon:'🧪' },
  { value:'katai',    label:'کٹائی',   en:'Harvest',       icon:'🌾' },
  { value:'bimari',   label:'بیماری',  en:'Disease',       icon:'🔬' },
  { value:'other',    label:'دیگر',    en:'Other',         icon:'📝' },
]

const MOODS = [
  { value:'good',    icon:'😊', label:'Good'    },
  { value:'neutral', icon:'😐', label:'Neutral' },
  { value:'bad',     icon:'😟', label:'Bad'     },
]

export default function FasalDiary() {
  const [tab,     setTab]     = useState('list')
  const [entries, setEntries] = useState([])
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [filter,  setFilter]  = useState('')

  const [form, setForm] = useState({
    crop:'', activity:'', note:'', weather:'', mood:'good',
    date: new Date().toISOString().split('T')[0],
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const loadEntries = async () => {
    setLoading(true)
    try {
      const url  = filter
        ? `${BACKEND}/api/diary/entries?crop=${encodeURIComponent(filter)}`
        : `${BACKEND}/api/diary/entries`
      const res  = await fetch(url)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch {}
    finally { setLoading(false) }
  }

  const loadStats = async () => {
    try {
      const res  = await fetch(`${BACKEND}/api/diary/stats`)
      const data = await res.json()
      setStats(data)
    } catch {}
  }

  useEffect(() => { loadEntries(); loadStats() }, [filter])

  const handleSave = async () => {
    if (!form.crop || !form.activity) return
    setSaving(true)
    try {
      const res  = await fetch(`${BACKEND}/api/diary/entries`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setForm({ crop:'', activity:'', note:'', weather:'', mood:'good',
                  date: new Date().toISOString().split('T')[0] })
        setTab('list')
        loadEntries()
        loadStats()
      }
    } catch {}
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${BACKEND}/api/diary/entries/${id}`, { method:'DELETE' })
      loadEntries()
      loadStats()
    } catch {}
  }

  const actObj  = (val) => ACTIVITIES.find(a => a.value === val)
  const moodObj = (val) => MOODS.find(m => m.value === val)

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'52px 20px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>📔</div>
            <div>
              <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Fasal Diary</div>
              <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>Record daily tasks</div>
            </div>
          </div>
          <button onClick={() => setTab(tab === 'add' ? 'list' : 'add')} style={{
            padding:'9px 18px', borderRadius:20, border:'none', cursor:'pointer',
            fontSize:13, fontWeight:700,
            background: tab === 'add' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
            color:      tab === 'add' ? 'white' : '#1B4D2E',
          }}>
            {tab === 'add' ? '← Diary' : '+ Entry'}
          </button>
        </div>

        {stats && (
          <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
            {[
              { icon:'📝', val: stats.total,      label:'Total'      },
              { icon:'📅', val: stats.this_month, label:'This month'  },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>{s.icon} {s.label}</div>
                <div style={{ fontSize:20, fontWeight:800, color:'white' }}>{s.val}</div>
              </div>
            ))}
            {stats.crops?.slice(0,2).map(c => (
              <div key={c.name} style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>Top Crop</div>
                <div style={{ fontSize:13, fontWeight:800, color:'white' }}>{c.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:'16px' }}>

        {/* ── ADD TAB ── */}
        {tab === 'add' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>

            {/* Fasal — text + buttons dono */}
            <div style={cardSt}>
              <div style={secTitleSt}>1️⃣ Select Crop *</div>

              <input
                type="text"
                placeholder="🌾 Write your crop — Wheat, Rice, Tomato..."
                value={form.crop}
                onChange={e => set('crop', e.target.value)}
                style={{ ...inputSt, marginBottom:12 }}
              />

              <div style={{ fontSize:11, color:'#94a3b8', marginBottom:8, fontWeight:500 }}>
                Or quickly select below:
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7 }}>
                {CROPS.map(c => {
                  const name = c.split(' ').slice(1).join(' ')
                  const icon = c.split(' ')[0]
                  return (
                    <button key={c} onClick={() => set('crop', name)} style={{
                      padding:'10px 6px', borderRadius:12, border:'none',
                      cursor:'pointer', textAlign:'center', fontFamily:'inherit',
                      background: form.crop===name
                        ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                      color: form.crop===name ? 'white' : '#1B4D2E',
                    }}>
                      <div style={{ fontSize:20 }}>{icon}</div>
                      <div style={{ fontSize:11, fontWeight:600, marginTop:3 }}>{name}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Activity */}
            <div style={cardSt}>
              <div style={secTitleSt}>2️⃣ Type of Work *</div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {ACTIVITIES.map(a => (
                  <button key={a.value} onClick={() => set('activity', a.value)} style={{
                    padding:'11px 14px', borderRadius:12, border:'none', cursor:'pointer',
                    fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left',
                    display:'flex', alignItems:'center', gap:10,
                    background: form.activity===a.value
                      ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                    color: form.activity===a.value ? 'white' : '#1B4D2E',
                  }}>
                    <span style={{ fontSize:18 }}>{a.icon}</span>
                    <span>{a.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Weather */}
            <div style={cardSt}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={lblSt}>📅 Date</label>
                  <input type="date" value={form.date}
                    onChange={e => set('date', e.target.value)} style={inputSt} />
                </div>
                <div>
                  <label style={lblSt}>⛅ Weather</label>
                  <input type="text" value={form.weather}
                    onChange={e => set('weather', e.target.value)}
                    placeholder="Hot, Rain, Cold..." style={inputSt} />
                </div>
              </div>
            </div>

            {/* Note */}
            <div style={cardSt}>
              <label style={secTitleSt}>3️⃣ Note (Optional)</label>
              <textarea value={form.note} onChange={e => set('note', e.target.value)}
                placeholder="What happened today, any problem, any observation..."
                rows={3} style={{ ...inputSt, resize:'vertical', lineHeight:1.6 }} />
            </div>

            {/* Mood */}
            <div style={cardSt}>
              <div style={secTitleSt}>4️⃣ Crop Condition</div>
              <div style={{ display:'flex', gap:10 }}>
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => set('mood', m.value)} style={{
                    flex:1, padding:'12px', borderRadius:12, border:'none',
                    cursor:'pointer', textAlign:'center', fontFamily:'inherit',
                    background: form.mood===m.value
                      ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                    color: form.mood===m.value ? 'white' : '#1B4D2E',
                  }}>
                    <div style={{ fontSize:22 }}>{m.icon}</div>
                    <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <button onClick={handleSave}
              disabled={!form.crop || !form.activity || saving}
              style={{
                width:'100%', padding:'15px', borderRadius:16, border:'none',
                background: (!form.crop || !form.activity || saving)
                  ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                color:'white', fontSize:15, fontWeight:700, fontFamily:'inherit',
                cursor: (!form.crop || !form.activity || saving) ? 'not-allowed' : 'pointer',
              }}>
              {saving ? '⏳ Saving...' : '💾 Save to Diary'}
            </button>
          </div>
        )}

        {/* ── LIST TAB ── */}
        {tab === 'list' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>

            <div style={{ display:'flex', gap:8, marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
              <button onClick={() => setFilter('')} style={{
                padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer',
                fontSize:12, fontWeight:600, whiteSpace:'nowrap',
                background: !filter ? '#1B4D2E' : '#e2e8f0',
                color:      !filter ? 'white'   : '#475569',
              }}>All</button>
              {['Wheat','Rice','Maize','Cotton','Tomato','Potato'].map(c => (
                <button key={c} onClick={() => setFilter(c === filter ? '' : c)} style={{
                  padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer',
                  fontSize:12, fontWeight:600, whiteSpace:'nowrap',
                  background: filter===c ? '#1B4D2E' : '#e2e8f0',
                  color:      filter===c ? 'white'   : '#475569',
                }}>{c}</button>
              ))}
            </div>

            {loading && (
              <div style={{ textAlign:'center', padding:'40px', color:'#888', fontSize:14 }}>
                ⏳ Loading...
              </div>
            )}

            {!loading && entries.length === 0 && (
              <div style={{ textAlign:'center', padding:'50px 20px' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📔</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#1B4D2E', marginBottom:6 }}>
                  No entries yet
                </div>
                <div style={{ fontSize:13, color:'#888', marginBottom:20 }}>
                  Add your first entry
                </div>
                <button onClick={() => setTab('add')} style={{
                  padding:'12px 24px', borderRadius:14, border:'none',
                  background:'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                  color:'white', fontSize:14, fontWeight:700, cursor:'pointer',
                }}>+ First Entry</button>
              </div>
            )}

            {entries.map(e => {
              const act  = actObj(e.activity)
              const mood = moodObj(e.mood)
              return (
                <div key={e.id} style={{ ...cardSt, animation:'fadeIn 0.3s ease' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:'#E8F5E9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                        {act?.icon || '📝'}
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1B4D2E' }}>
                          {act?.en || e.activity}
                        </div>
                        <div style={{ fontSize:12, color:'#64748b' }}>🌾 {e.crop}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(e.id)} style={{
                      width:28, height:28, borderRadius:'50%', border:'none',
                      background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:14,
                    }}>×</button>
                  </div>

                  {e.note && (
                    <div style={{ background:'#F8FFF8', borderRadius:10, padding:'8px 12px', fontSize:13, color:'#334155', marginBottom:8, lineHeight:1.6 }}>
                      {e.note}
                    </div>
                  )}

                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'#94a3b8' }}>📅 {e.date}</span>
                    {e.weather && <span style={{ fontSize:11, color:'#94a3b8' }}>⛅ {e.weather}</span>}
                    {mood && <span style={{ fontSize:11, color:'#94a3b8' }}>{mood.icon} {mood.label}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const cardSt    = { background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }
const secTitleSt= { fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:10, display:'block' }
const lblSt     = { display:'block', fontSize:12, fontWeight:700, color:'#1B4D2E', marginBottom:6 }
const inputSt   = { width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }