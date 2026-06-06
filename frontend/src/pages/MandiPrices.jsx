// src/pages/MandiPrices.jsx
import { useState, useEffect } from 'react'
import { mandiAPI, aiAPI } from '../services/api'
import { saveToCache, getFromCache } from '../hooks/useOffline'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const DISTRICT_CITIES = {
  'Attock':        ['Hasanabdal','Hazro'],
  'Bahawalnagar':  ['BahawalNagar','Chistian','Fortabas','HaroonAbad','Minchanabad'],
  'Bahawalpur':    ['AhmadPurEast','BahawalPur','HasalPur','Yazman','Khairpurtamewali'],
  'Bhakkar':       ['Bhakhar','Kalurkot'],
  'Chakwal':       ['Chakwal','ChuaSaidanShah','TalaGang'],
  'Chiniot':       ['Chiniot','Lalian'],
  'DGKhan':        ['DGKhan','KotChutta','Taunsasharif'],
  'Faisalabad':    ['ChackJhumra','Faisalabad','Jaranwala','Mamunkanjan','Summandri','Tandlianwala'],
  'Gujranwala':    ['AliPurChatta','Eminabad','Ghakhar','Gujranwala','Kamoke','Noshehrawirkan','Qiladedarsingh','Wazirabad'],
  'Gujrat':        ['Dinga','Gujrat','JalalPurJattan','LalaMusa','Sraialamgir'],
  'Hafizabad':     ['Hafizabad','Pindibhattian','Sukheke'],
  'Jhang':         ['Jhang','Shahjewana','Shorkot'],
  'Jhelum':        ['Jhelum','Pinanwal'],
  'Kasur':         ['Chunian','Kanganpur','Kasur','Khudian','Kotradhakishan','Patoki','PhoolNagar'],
  'Khanewal':      ['Abdulhakim','Jahanian','KabirWala','KachaKhu','Khanewal','MianChannu'],
  'Khushab':       ['Jauharabad','Mithatiwana','Quaidabad'],
  'Lahore':        ['Lahore','Lahore(Singhpura)','MultanRoadLahore','Kotlakhpat','Raiwind'],
  'Layyah':        ['Fatehpur','Layyah'],
  'Lodhran':       ['DunyaPur','Kahrorpacca','Lodhran'],
  'MandiBahaudin': ['MandiBahaudin','Malakwal'],
  'Mianwali':      ['Mianwali','Piplan'],
  'Multan':        ['Multan','Jalalpurpirwala','Qadirpurrawan','ShujaAbad'],
  'Muzaffargarh':  ['Alipur','KotAdu','MuzafarGhar','ShahrSultan'],
  'Nankana Sb.':   ['Nankana','Sanglahill','Warberten'],
  'Narowal':       ['Badomalhi','Narowal','Shakargarh'],
  'Okara':         ['Basirpur','Depalpur','Havelilakha','HujraShahmuqeem','Okara','RenalaKhurd'],
  'Pakpattan':     ['ArifWala','PakPattan'],
  'RahimYarKhan':  ['Khanpur','LiaqatPur','RahimYarKhan','SadiqAbad'],
  'Rajanpur':      ['JamPur','RajanPur'],
  'Rawalpindi':    ['GujarKhan','Rawalpindi'],
  'Sahiwal':       ['Chichawatni','Kassowal','Sahiwal'],
  'Sargodha':      ['Bhalwal','Kotmoman','Phularwan','Sargodha','Sillanwali'],
  'Sheikhupura':   ['Farooqabad','Mananwala','Muridke','Narangmandi','Safdarabad','Sheikhupura'],
  'Sialkot':       ['Daska','Pasroor','Sambrial','Sialkot'],
  'TTSingh':       ['Gojra','Kamalia','PirMahal','TTSingh'],
  'Vehari':        ['Burewala','Mailsi','Vehari'],
  'Other':         ['Attock','Hyderabad','Karachi','Quetta','Gwadar','Murree'],
}

const ALL_CITIES = Object.values(DISTRICT_CITIES).flat().sort()

const ALL_FASALS = [
  { name:'Wheat',       urdu:'گندم',      icon:'🌾', unit:'Mann' },
  { name:'Rice',        urdu:'چاول',      icon:'🍚', unit:'Mann' },
  { name:'Sugarcane',   urdu:'گنا',       icon:'🎋', unit:'Mann' },
  { name:'Cotton',      urdu:'کپاس',      icon:'🌿', unit:'Mann' },
  { name:'Maize',       urdu:'مکئی',      icon:'🌽', unit:'Mann' },
  { name:'Tomato',      urdu:'ٹماٹر',     icon:'🍅', unit:'KG'   },
  { name:'Potato',      urdu:'آلو',       icon:'🥔', unit:'KG'   },
  { name:'Onion',       urdu:'پیاز',      icon:'🧅', unit:'KG'   },
  { name:'Chilli',      urdu:'مرچ',       icon:'🌶️', unit:'KG'   },
  { name:'Eggplant',    urdu:'بینگن',     icon:'🍆', unit:'KG'   },
  { name:'Carrot',      urdu:'گاجر',      icon:'🥕', unit:'KG'   },
  { name:'Peas',        urdu:'مٹر',       icon:'🫛', unit:'KG'   },
  { name:'Spinach',     urdu:'پالک',      icon:'🥬', unit:'KG'   },
  { name:'Mango',       urdu:'آم',        icon:'🥭', unit:'KG'   },
  { name:'Banana',      urdu:'کیلا',      icon:'🍌', unit:'KG'   },
  { name:'Orange',      urdu:'سنترہ',     icon:'🍊', unit:'KG'   },
  { name:'Guava',       urdu:'امرود',     icon:'🍈', unit:'KG'   },
  { name:'Mung',        urdu:'مونگ',      icon:'🫘', unit:'KG'   },
  { name:'Masoor',      urdu:'مسور',      icon:'🫘', unit:'KG'   },
  { name:'Mustard',     urdu:'سرسوں',     icon:'🌻', unit:'Mann' },
  { name:'Peanut',      urdu:'مونگ پھلی', icon:'🥜', unit:'KG'   },
  { name:'Garlic',      urdu:'لہسن',      icon:'🧄', unit:'KG'   },
]

function getFasalIcon(name) {
  const match = ALL_FASALS.find(f =>
    name?.toLowerCase().includes(f.name.toLowerCase()) ||
    f.name.toLowerCase().includes(name?.toLowerCase())
  )
  return match?.icon || '🌾'
}

function CustomTooltip({ active, payload, label }) {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    return (
      <div style={{ background:'white', border:'1px solid #C8EDD6', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontSize:11, color:'#888', margin:'0 0 4px' }}>{label}</p>
        <p style={{ fontSize:16, fontWeight:800, color:'#1B4D2E', margin:0 }}>Rs. {payload[0].value?.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function MandiPrices() {
  const { t } = useTranslation()
  const { isLoggedIn, user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [city,           setCity]           = useState('Lahore')
  const [citySearch,     setCitySearch]     = useState('')
  const [showCityDrop,   setShowCityDrop]   = useState(false)
  const [showDistrictView, setShowDistrictView] = useState(false)
  const [openDistrict,   setOpenDistrict]   = useState(null)
  const [dbPrices,       setDbPrices]       = useState([])
  const [dbLoading,      setDbLoading]      = useState(true)
  const [aiResult,       setAiResult]       = useState(null)
  const [aiLoading,      setAiLoading]      = useState(false)
  const [aiError,        setAiError]        = useState('')
  const [activeTab,      setActiveTab]      = useState('db')
  const [scrapeLoading,  setScrapeLoading]  = useState(false)
  const [scrapeMsg,      setScrapeMsg]      = useState('')
  const [customQuery,    setCustomQuery]    = useState('')
  const [customResult,   setCustomResult]   = useState('')
  const [customLoading,  setCustomLoading]  = useState(false)
  const [csvFile,        setCsvFile]        = useState(null)
  const [csvLoading,     setCsvLoading]     = useState(false)
  const [csvResult,      setCsvResult]      = useState(null)
  const [csvError,       setCsvError]       = useState('')
  const [graphFasal,     setGraphFasal]     = useState('Wheat')
  const [graphDays,      setGraphDays]      = useState(30)
  const [graphData,      setGraphData]      = useState(null)
  const [graphLoading,   setGraphLoading]   = useState(false)

  const filteredCities = ALL_CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  )

  useEffect(() => { loadDbPrices() }, [city])
  useEffect(() => { if (activeTab === 'graph') loadGraph() }, [activeTab, city, graphFasal, graphDays])

  async function loadDbPrices() {
    setDbLoading(true)
    try {
      const data = await mandiAPI.getPrices(city)
      setDbPrices(data)
      saveToCache(`mandi_${city}`, data)
    } catch {
      const cached = getFromCache(`mandi_${city}`)
      setDbPrices(cached || [])
    } finally { setDbLoading(false) }
  }

  async function loadGraph() {
    setGraphLoading(true); setGraphData(null)
    try {
      const res = await api.get(`/api/mandi/history?city=${encodeURIComponent(city)}&fasal=${encodeURIComponent(graphFasal)}&days=${graphDays}`)
      setGraphData(res.data)
    } catch {}
    setGraphLoading(false)
  }

  async function getAiPrices() {
    if (!isLoggedIn) { setAiError(t('mandi.aiLoginRequired')); return }
    setAiLoading(true); setAiResult(null); setAiError('')
    const fasalNames = ALL_FASALS.slice(0, 15).map(f => f.name).join(', ')
    try {
      const reply = await aiAPI.mandi([{
        role: 'user',
        content: `Give approximate prices for these crops in ${city} mandi today in JSON: ${fasalNames}
Respond ONLY in this format: {"prices":[{"name":"Wheat","price":4200,"unit":"Mann","trend":"up","change":"+2%"}],"advice":"..."}`
      }])
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) setAiResult(JSON.parse(jsonMatch[0]))
      else setAiError(t('mandi.aiParseError'))
    } catch (err) {
      if (err.response?.status === 401) setAiError(t('mandi.loginRequired'))
      else if (err.response?.status === 429) setAiError(t('mandi.rateLimit'))
      else setAiError(t('common.error'))
    } finally { setAiLoading(false) }
  }

  async function getCustomPrice() {
    if (!customQuery.trim()) return
    setCustomLoading(true); setCustomResult('')
    try {
      const reply = await aiAPI.mandi([{ role:'user', content: customQuery }])
      setCustomResult(reply)
    } catch { setCustomResult(t('common.error')) }
    setCustomLoading(false)
  }

  async function uploadCsv() {
    if (!csvFile) return
    setCsvLoading(true); setCsvResult(null); setCsvError('')
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      const res = await api.post('/api/mandi/bulk-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setCsvResult(res.data); setCsvFile(null); loadDbPrices()
    } catch (err) { setCsvError(err.response?.data?.detail || t('mandi.uploadFailed')) }
    setCsvLoading(false)
  }

  async function downloadTemplate() {
    try {
      const res = await api.get('/api/mandi/csv-template', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = 'mandi_template.csv'; a.click()
    } catch {}
  }

  async function triggerScrape() {
    setScrapeLoading(true); setScrapeMsg('')
    try {
      await api.post('/api/mandi/scrape-now')
      setScrapeMsg(t('mandi.scrapeStarted'))
      setTimeout(() => loadDbPrices(), 10000)
    } catch (err) { setScrapeMsg(t('mandi.scrapeError') + (err.response?.data?.detail || '')) }
    setScrapeLoading(false)
  }

  const selectCity = (c) => {
    setCity(c)
    setCitySearch('')
    setShowCityDrop(false)
    setShowDistrictView(false)
    setAiResult(null)
    setGraphData(null)
  }

  const tabs = [
    { k:'db',    label:t('mandi.tabs.rates')  },
    { k:'graph', label:t('mandi.tabs.graph')  },
    { k:'ai',    label:t('mandi.tabs.ai')     },
    { k:'query', label:t('mandi.tabs.query')  },
    ...(isAdmin ? [{ k:'admin', label:t('mandi.tabs.admin') }] : [])
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes shimmer { 0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div className="kisan-header" style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'16px 20px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>💰</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>{t('mandi.title')}</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>{t('mandi.subtitle')}</div>
          </div>
        </div>

        {/* Search + District toggle */}
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <div style={{ position:'relative', flex:1 }}>
            <input
              placeholder={t('mandi.searchCityPlaceholder')}
              value={citySearch || (showDistrictView ? '' : city)}
              onChange={e => { setCitySearch(e.target.value); setShowCityDrop(true); setShowDistrictView(false) }}
              onFocus={() => { setCitySearch(''); setShowCityDrop(true) }}
              style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'none', background:'rgba(255,255,255,0.15)', color:'white', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
            />
            {showCityDrop && !showDistrictView && filteredCities.length > 0 && (
              <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'white', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.2)', zIndex:100, maxHeight:200, overflowY:'auto', marginTop:4 }}>
                {filteredCities.map(c => (
                  <button key={c} onClick={() => selectCity(c)}
                    style={{ width:'100%', padding:'11px 16px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', fontSize:14, color:'#1B4D2E', fontWeight:600, borderBottom:'1px solid #F0F7F0', fontFamily:'inherit' }}>
                    📍 {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => { setShowDistrictView(p => !p); setShowCityDrop(false) }}
            style={{ padding:'12px', borderRadius:12, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, whiteSpace:'nowrap',
              background: showDistrictView ? 'white' : 'rgba(255,255,255,0.2)',
              color:      showDistrictView ? '#1B4D2E' : 'white',
            }}>
            🏘️ {t('mandi.districtView')}
          </button>
        </div>

        {/* District View */}
        {showDistrictView && (
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:14, padding:12, maxHeight:280, overflowY:'auto', animation:'fadeIn 0.2s ease' }}>
            {Object.keys(DISTRICT_CITIES).sort().map(district => (
              <div key={district} style={{ marginBottom:6 }}>
                <button
                  onClick={() => setOpenDistrict(openDistrict === district ? null : district)}
                  style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', color:'white', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
                  <span>🏘️ {district} <span style={{ fontSize:11, opacity:0.7 }}>({DISTRICT_CITIES[district].length})</span></span>
                  <span style={{ transform: openDistrict===district?'rotate(180deg)':'rotate(0)', transition:'0.2s' }}>⌄</span>
                </button>
                {openDistrict === district && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'8px 4px', animation:'fadeIn 0.2s ease' }}>
                    {DISTRICT_CITIES[district].map(c => (
                      <button key={c} onClick={() => selectCity(c)} style={{
                        padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer',
                        fontSize:12, fontWeight:600, fontFamily:'inherit',
                        background: city===c ? 'white' : 'rgba(255,255,255,0.15)',
                        color:      city===c ? '#1B4D2E' : 'white',
                      }}>📍 {c}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:8 }}>
          <span style={{ background:'rgba(255,255,255,0.2)', color:'white', padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700 }}>📍 {city}</span>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        <div className="mandi-tabs" style={{ display:'flex', background:'white', borderRadius:14, padding:4, marginBottom:16, border:'1px solid #C8EDD6', gap:4, minWidth:0 }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)} style={{
              flex:1, padding:'10px 4px', borderRadius:10, border:'none', cursor:'pointer',
              fontWeight:700, fontSize:11, fontFamily:'inherit',
              background: activeTab === t.k ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : 'transparent',
              color:      activeTab === t.k ? 'white' : '#5A8A6A',
            }}>{t.label}</button>
          ))}
        </div>

        {activeTab === 'db' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:13, color:'#666', fontWeight:600 }}>📍 {city} — {dbPrices.length} {t('mandi.entries')}</div>
              <button onClick={loadDbPrices} style={{ padding:'6px 14px', background:'#F0F7F0', border:'1px solid #C8EDD6', borderRadius:8, fontSize:12, color:'#1B4D2E', cursor:'pointer', fontWeight:600 }}>{t('common.refresh')}</button>
            </div>
            {dbLoading ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ height:120, borderRadius:18, background:'#e8f5e9', animation:'shimmer 1.5s infinite' }} />)}
              </div>
            ) : dbPrices.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', background:'white', borderRadius:18 }}>
                <div style={{ fontSize:48 }}>📭</div>
                <div style={{ color:'#666', marginTop:12, fontSize:14, fontWeight:600 }}>{t('mandi.noPrices', { city })}</div>
                <button onClick={() => setActiveTab('ai')} style={{ background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', border:'none', borderRadius:12, padding:'10px 24px', fontWeight:700, cursor:'pointer', fontSize:13, marginTop:12 }}>{t('mandi.getAiPrices')}</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {dbPrices.map((p, i) => {
                  const isUp = p.change > 0; const isDown = p.change < 0
                  return (
                    <div key={i} style={{ background:'white', borderRadius:18, padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:`1.5px solid ${isUp ? '#BBF7D0' : isDown ? '#FECACA' : '#E8F4E8'}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ fontSize:28 }}>{getFasalIcon(p.fasal_eng)}</div>
                        {p.change !== 0 && <div style={{ background: isUp ? '#DCFCE7' : '#FEE2E2', color: isUp ? '#16A34A' : '#DC2626', borderRadius:8, padding:'3px 8px', fontSize:11, fontWeight:700 }}>{isUp ? `▲ +${p.change}` : `▼ ${p.change}`}</div>}
                      </div>
                      <div style={{ fontWeight:700, fontSize:13, color:'#1a1a1a', marginTop:8 }}>{p.fasal_urdu}</div>
                      <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>{p.fasal_eng}</div>
                      <div style={{ fontWeight:900, fontSize:20, color:'#1B4D2E' }}>Rs. {Number(p.price).toLocaleString()}</div>
                      <div style={{ fontSize:11, color:'#999', marginTop:2 }}>per {p.unit} • {p.price_date}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'graph' && (
          <div>
            <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:10 }}>{t('mandi.graph.selectCrop')}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                {ALL_FASALS.slice(0, 10).map(f => (
                  <button key={f.name} onClick={() => setGraphFasal(f.name)} style={{
                    padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer',
                    fontSize:12, fontWeight:600, fontFamily:'inherit',
                    background: graphFasal === f.name ? '#1B4D2E' : '#F0F7F0',
                    color:      graphFasal === f.name ? 'white'   : '#1B4D2E',
                  }}>{f.icon} {f.name}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {[7, 14, 30, 60].map(d => (
                  <button key={d} onClick={() => setGraphDays(d)} style={{
                    flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer',
                    fontSize:12, fontWeight:700, fontFamily:'inherit',
                    background: graphDays === d ? '#1B4D2E' : '#F0F7F0',
                    color:      graphDays === d ? 'white'   : '#1B4D2E',
                  }}>{d} {t('mandi.graph.days')}</button>
                ))}
              </div>
            </div>

            {graphLoading ? (
              <div style={{ textAlign:'center', padding:'40px', background:'white', borderRadius:18 }}>
                <div style={{ width:36, height:36, border:'3px solid #C8EDD6', borderTop:'3px solid #1B4D2E', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }} />
                <p style={{ color:'#888', marginTop:12, fontSize:13 }}>{t('mandi.graph.loading')}</p>
              </div>
            ) : graphData && graphData.history.length > 0 ? (
              <div style={{ background:'white', borderRadius:18, padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', animation:'fadeIn 0.4s ease' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15, color:'#1B4D2E' }}>{getFasalIcon(graphFasal)} {graphFasal} — {city}</div>
                    <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{t('mandi.graph.trendLabel', { days: graphDays })}</div>
                  </div>
                  <div style={{
                    background: graphData.stats.trend === 'up' ? '#DCFCE7' : graphData.stats.trend === 'down' ? '#FEE2E2' : '#F0F7F0',
                    color:      graphData.stats.trend === 'up' ? '#16A34A' : graphData.stats.trend === 'down' ? '#DC2626' : '#666',
                    borderRadius:10, padding:'6px 12px', fontSize:13, fontWeight:700,
                  }}>
                    {graphData.stats.trend === 'up' ? '▲' : graphData.stats.trend === 'down' ? '▼' : '—'} {Math.abs(graphData.stats.change_pct)}%
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:16 }}>
                  {[
                    { label:t('mandi.graph.current'), val:`Rs.${Math.round(graphData.stats.latest).toLocaleString()}`, color:'#1B4D2E' },
                    { label:t('mandi.graph.highest'), val:`Rs.${Math.round(graphData.stats.max).toLocaleString()}`,    color:'#16A34A' },
                    { label:t('mandi.graph.lowest'),  val:`Rs.${Math.round(graphData.stats.min).toLocaleString()}`,    color:'#DC2626' },
                    { label:t('mandi.graph.average'), val:`Rs.${Math.round(graphData.stats.avg).toLocaleString()}`,    color:'#D97706' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'#F8FFF8', borderRadius:10, padding:'10px 6px', textAlign:'center', border:'1px solid #E8F4E8' }}>
                      <div style={{ fontSize:10, color:'#888', marginBottom:4 }}>{s.label}</div>
                      <div style={{ fontWeight:800, fontSize:12, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={graphData.history} margin={{ top:5, right:5, left:0, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F7F0" />
                    <XAxis dataKey="date" tick={{ fontSize:9, fill:'#888' }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize:9, fill:'#888' }} tickFormatter={v => `${(v/1000).toFixed(1)}k`} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={graphData.stats.avg} stroke="#D97706" strokeDasharray="4 4" label={{ value:t('mandi.graph.avgLabel'), position:'right', fontSize:9, fill:'#D97706' }} />
                    <Line type="monotone" dataKey="price" stroke="#1B4D2E" strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:'#1B4D2E' }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ marginTop:12, padding:'10px 14px', borderRadius:12, fontSize:12, lineHeight:1.6,
                  background: graphData.stats.trend === 'up' ? '#F0FFF4' : '#FFF8E1',
                  border: `1px solid ${graphData.stats.trend === 'up' ? '#C8EDD6' : '#FDE68A'}`,
                  color:  graphData.stats.trend === 'up' ? '#1B4D2E' : '#92400E',
                }}>
                  {graphData.stats.trend === 'up'
                    ? t('mandi.graph.trendUp', { crop: graphFasal, pct: graphData.stats.change_pct })
                    : graphData.stats.trend === 'down'
                    ? t('mandi.graph.trendDown', { crop: graphFasal, pct: Math.abs(graphData.stats.change_pct) })
                    : t('mandi.graph.trendStable', { crop: graphFasal, avg: Math.round(graphData.stats.avg).toLocaleString() })
                  }
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 20px', background:'white', borderRadius:18 }}>
                <div style={{ fontSize:48 }}>📊</div>
                <div style={{ color:'#666', marginTop:12, fontSize:14, fontWeight:600 }}>{t('mandi.graph.noData', { city, crop: graphFasal })}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <>
            <div style={{ background:'#FEF3C7', borderRadius:14, padding:'12px 14px', marginBottom:14, border:'1px solid #FDE68A', display:'flex', gap:8 }}>
              <span>⚠️</span>
              <div style={{ fontSize:12, color:'#92400E', lineHeight:1.5 }}>{t('mandi.aiDisclaimer')}</div>
            </div>
            {aiError && <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'10px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>❌ {aiError}</div>}
            <button onClick={getAiPrices} disabled={aiLoading || !isLoggedIn} style={{
              width:'100%', padding:'15px', borderRadius:16, border:'none',
              background: (aiLoading || !isLoggedIn) ? '#ccc' : 'linear-gradient(135deg,#D97706,#F59E0B)',
              color:'white', fontSize:15, fontWeight:700, cursor: (aiLoading || !isLoggedIn) ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              {aiLoading ? <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />{t('mandi.aiFetching')}</> : !isLoggedIn ? t('mandi.loginRequired') : t('mandi.getAiPricesBtn', { city })}
            </button>
            {aiResult && (
              <>
                {aiResult.advice && <div style={{ background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', borderRadius:18, padding:'16px', marginBottom:14, color:'white' }}><div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>🤖 {t('mandi.aiAdvice')}</div><div style={{ fontSize:13, lineHeight:1.6, color:'#A7D9B5' }}>{aiResult.advice}</div></div>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, animation:'fadeIn 0.4s ease' }}>
                  {aiResult.prices?.map((p, i) => {
                    const fasal = ALL_FASALS.find(f => f.name === p.name)
                    const isUp  = p.trend === 'up'
                    return (
                      <div key={i} style={{ background:'white', borderRadius:18, padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:`1.5px solid ${isUp ? '#BBF7D0' : '#FECACA'}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <div style={{ fontSize:28 }}>{fasal?.icon || '🌾'}</div>
                          <div style={{ background: isUp ? '#DCFCE7' : '#FEE2E2', color: isUp ? '#16A34A' : '#DC2626', borderRadius:8, padding:'3px 8px', fontSize:11, fontWeight:700 }}>{isUp ? '▲' : '▼'} {p.change}</div>
                        </div>
                        <div style={{ fontWeight:700, fontSize:14, color:'#1a1a1a', marginTop:8 }}>{p.name}</div>
                        <div style={{ fontWeight:900, fontSize:20, color:'#1B4D2E', marginTop:4 }}>Rs. {p.price?.toLocaleString()}</div>
                        <div style={{ fontSize:11, color:'#999', marginTop:2 }}>per {p.unit}</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'query' && (
          <div style={{ background:'white', borderRadius:18, padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:8 }}>{t('mandi.query.title')}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
              {[
                t('mandi.query.example1'),
                t('mandi.query.example2'),
                t('mandi.query.example3'),
                t('mandi.query.example4')
              ].map(q => (
                <button key={q} onClick={() => setCustomQuery(q)} style={{ padding:'6px 12px', borderRadius:20, border:'1px solid #C8EDD6', background:'#F8FFF8', color:'#1B4D2E', fontSize:11, fontWeight:600, cursor:'pointer' }}>{q}</button>
              ))}
            </div>
            <textarea placeholder={t('mandi.query.placeholder')} value={customQuery} onChange={e => setCustomQuery(e.target.value)} rows={3}
              style={{ width:'100%', padding:'12px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', resize:'none', boxSizing:'border-box', marginBottom:10 }} />
            <button onClick={getCustomPrice} disabled={customLoading || !isLoggedIn || !customQuery.trim()} style={{
              width:'100%', padding:'14px', borderRadius:14, border:'none',
              background: (customLoading || !isLoggedIn || !customQuery.trim()) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
              color:'white', fontSize:14, fontWeight:700, cursor: (customLoading || !isLoggedIn || !customQuery.trim()) ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              {customLoading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />{t('mandi.query.searching')}</> : t('mandi.query.askBtn')}
            </button>
            {!isLoggedIn && <div style={{ marginTop:8, fontSize:12, color:'#92400E', background:'#FEF3C7', borderRadius:10, padding:'8px 12px', border:'1px solid #FDE68A' }}>{t('mandi.loginRequired')}</div>}
            {customResult && <div style={{ marginTop:14, background:'#F8FFF8', borderRadius:14, padding:'14px', fontSize:13, lineHeight:1.9, color:'#1a1a1a', border:'1px solid #E8F4E8', whiteSpace:'pre-wrap', animation:'fadeIn 0.4s ease' }}>{customResult}</div>}
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'white', borderRadius:18, padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:8 }}>{t('mandi.admin.autoUpdateTitle')}</div>
              <div style={{ fontSize:12, color:'#666', marginBottom:12, lineHeight:1.7 }}>{t('mandi.admin.autoUpdateDesc')}</div>
              {scrapeMsg && <div style={{ borderRadius:10, padding:'10px 12px', fontSize:12, marginBottom:12, fontWeight:600, background: scrapeMsg.includes('started') ? '#F0FFF4' : '#FFF0F0', color: scrapeMsg.includes('started') ? '#1B4D2E' : '#CC0000', border:`1px solid ${scrapeMsg.includes('started') ? '#C8EDD6' : '#FFB3B3'}` }}>{scrapeMsg}</div>}
              <button onClick={triggerScrape} disabled={scrapeLoading} style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background: scrapeLoading ? '#ccc' : 'linear-gradient(135deg,#D97706,#F59E0B)', color:'white', fontSize:14, fontWeight:700, cursor: scrapeLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
                {scrapeLoading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />{t('mandi.admin.scraping')}</> : t('mandi.admin.scrapeBtn')}
              </button>
              <div style={{ fontSize:11, color:'#888', textAlign:'center' }}>⏰ {t('mandi.admin.autoTime')}</div>
            </div>
            <div style={{ background:'white', borderRadius:18, padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:8 }}>{t('mandi.admin.csvUploadTitle')}</div>
              <div style={{ background:'#E8F5E9', borderRadius:12, padding:'12px', marginBottom:12, border:'1px solid #C8EDD6' }}>
                <div style={{ fontSize:11, color:'#555', marginBottom:8, fontFamily:'monospace', background:'white', padding:'6px 8px', borderRadius:6 }}>fasal_urdu, fasal_eng, city, price, unit, change, price_date</div>
                <button onClick={downloadTemplate} style={{ background:'#1B4D2E', color:'white', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer', fontSize:12 }}>{t('mandi.admin.downloadTemplate')}</button>
              </div>
              <div style={{ border:'2px dashed #C8EDD6', borderRadius:12, padding:'20px', textAlign:'center', marginBottom:12, background:'#F8FFF8' }}>
                <div style={{ fontSize:32, marginBottom:6 }}>📁</div>
                <input type="file" accept=".csv" onChange={e => { setCsvFile(e.target.files[0]); setCsvResult(null); setCsvError('') }} style={{ display:'none' }} id="csvInput" />
                <label htmlFor="csvInput" style={{ background:'#1B4D2E', color:'white', padding:'8px 20px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:12 }}>{t('mandi.admin.chooseFile')}</label>
                {csvFile && <div style={{ marginTop:10, fontSize:13, color:'#1B4D2E', fontWeight:600 }}>✅ {csvFile.name}</div>}
              </div>
              {csvError  && <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:10, padding:'10px 12px', color:'#CC0000', fontSize:12, marginBottom:10 }}>❌ {csvError}</div>}
              {csvResult && <div style={{ background:'#F0FFF4', border:'1px solid #C8EDD6', borderRadius:10, padding:'10px 12px', marginBottom:10 }}><div style={{ fontWeight:700, fontSize:12, color:'#1B4D2E' }}>{csvResult.message}</div></div>}
              <button onClick={uploadCsv} disabled={!csvFile || csvLoading} style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background: (!csvFile || csvLoading) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontSize:14, fontWeight:700, cursor: (!csvFile || csvLoading) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {csvLoading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />{t('mandi.admin.uploading')}</> : t('mandi.admin.uploadCsvBtn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}