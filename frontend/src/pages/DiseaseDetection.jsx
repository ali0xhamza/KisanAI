import { useState, useRef } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const FASALS = [
  'Tomato', 'Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize',
  'Potato', 'Onion', 'Chili', 'Eggplant', 'Carrot', 'Peas',
  'Spinach', 'Tinda', 'Kadu', 'Mustard', 'Mango', 'Kinnow',
  'Guava', 'Peanut', 'Garlic', 'Ginger', 'Radish', 'Turnip'
]

const SYMPTOMS = [
  'Yellow spots on leaves', 'Black/brown spots on leaves',
  'Leaves are wilting', 'Leaves are falling off',
  'Stem rot', 'Weak roots',
  'Spots on fruit', 'Small fruit size',
  'Plant not growing', 'White powder on leaves',
  'Red/small insects', 'Leaves are dying',
  'Flowers falling off', 'Yellow color — nutrient deficiency'
]

export default function DiseaseDetection() {
  const { isLoggedIn } = useAuth()
  const [fasal, setFasal]         = useState('')
  const [symptoms, setSymptoms]   = useState([])
  const [customText, setCustom]   = useState('')
  const [image, setImage]         = useState(null)
  const [preview, setPreview]     = useState(null)
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const fileRef = useRef(null)

  function toggleSymptom(s) {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Photo should not exceed 5MB'); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  async function analyze() {
    // Validation: either image, or crop+symptoms, or symptoms only (with crop optional)
    if (!image && !fasal && symptoms.length === 0 && !customText.trim()) {
      setError('Please upload a photo or provide crop name and/or symptoms')
      return
    }
    if (!isLoggedIn) { setError('Please login for diagnosis!'); return }

    setLoading(true)
    setResult(null)
    setError('')

    try {
      let imageBase64 = null
      let imageType = 'image/jpeg'
      if (image) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result
            const base64 = result.split(',')[1]
            imageType = result.split(';')[0].split(':')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(image)
        })
      }

      const allSymptoms = [...symptoms]
      if (customText.trim()) allSymptoms.push(customText.trim())

      const res = await api.post('/api/ai/disease', {
        fasal: fasal || null,          // send null if empty
        symptoms: allSymptoms,
        image_base64: imageBase64,
        image_type: imageType,
      })

      setResult({
        text: res.data.reply,
        fasal: fasal || 'Detected by AI',
        symptoms: allSymptoms,
        usedImage: res.data.used_image,
        time: new Date().toLocaleString('ur-PK')
      })
    } catch (err) {
      if (err.response?.status === 401) setError('Please login')
      else if (err.response?.status === 429) setError('Please wait and try again')
      else setError('Something went wrong — please try again!')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFasal(''); setSymptoms([]); setCustom('')
    setImage(null); setPreview(null); setResult(null); setError('')
  }

  // (same styles and JSX as before, but modify the crop step as shown)
  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header (unchanged) */}
<div className="kisan-header" style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'16px 20px 24px' }}>        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>🔬</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Disease Detection</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>Photo + Symptoms → AI Accurate Diagnosis</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {!isLoggedIn && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', gap:8 }}>
            <span>⚠️</span>
            <span style={{ fontSize:13, color:'#92400E', fontWeight:600 }}>Login required for diagnosis</span>
          </div>
        )}

        {/* How it works */}
        <div style={{ background:'linear-gradient(135deg,rgba(27,77,46,0.08),rgba(45,122,71,0.05))', border:'1px solid #C8EDD6', borderRadius:14, padding:'12px 16px', marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#1B4D2E', marginBottom:6 }}>📸 For better diagnosis:</div>
          <div style={{ fontSize:12, color:'#4a7c59', lineHeight:1.6 }}>
            ✅ Upload a clear close-up photo of the affected part<br/>
            ✅ Select symptoms you observe (optional)<br/>
            ✅ Crop name is optional — AI can identify it from photo<br/>
            ✅ Photo + details = <strong>Most Accurate</strong>
          </div>
        </div>

        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'10px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>❌ {error}</div>
        )}

        {/* Step 1 - Crop (optional) */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>1️⃣ Crop (optional – AI can detect from photo)</div>
          
          {/* Quick select buttons */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
            {FASALS.map(f => (
              <button key={f} onClick={() => { setFasal(f); setError('') }} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', background: fasal===f ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0', color: fasal===f ? 'white' : '#1B4D2E' }}>
                {f}
              </button>
            ))}
            <button onClick={() => setFasal('')} style={{ padding:'7px 14px', borderRadius:20, border:'1px dashed #1B4D2E', background:'white', color:'#1B4D2E', fontSize:12, fontWeight:600, cursor:'pointer' }}>Clear</button>
          </div>
          
          {/* Custom text input */}
          <input
            type="text"
            value={fasal}
            onChange={e => setFasal(e.target.value)}
            placeholder="Or type your own crop (e.g., Strawberry, Watermelon)"
            style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
          />
          <div style={{ fontSize:11, color:'#888', marginTop:4 }}>
            💡 If you don't know the crop, just upload a clear photo – AI will identify it.
          </div>
        </div>

        {/* Step 2 - Photo */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E' }}>2️⃣ Photo of Disease</div>
            <span style={{ background:'#DCFCE7', color:'#16A34A', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>RECOMMENDED</span>
          </div>
          {!preview ? (
            <div onClick={() => fileRef.current.click()} style={{ border:'2px dashed #C8EDD6', borderRadius:14, padding:'28px 20px', textAlign:'center', cursor:'pointer', background:'#F8FFF8' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>📸</div>
              <div style={{ fontWeight:700, color:'#1B4D2E', fontSize:14 }}>Upload Photo</div>
              <div style={{ color:'#999', fontSize:12, marginTop:4 }}>Close-up of affected area • Max 5MB • JPG/PNG</div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display:'none' }} />
            </div>
          ) : (
            <div style={{ position:'relative' }}>
              <img src={preview} alt="crop" style={{ width:'100%', borderRadius:12, maxHeight:220, objectFit:'cover' }} />
              <div style={{ position:'absolute', top:8, left:8, background:'rgba(22,163,74,0.9)', color:'white', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700 }}>✅ Photo Ready</div>
              <button onClick={() => { setImage(null); setPreview(null) }} style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:8, color:'white', padding:'4px 10px', cursor:'pointer', fontSize:12 }}>✕ Remove</button>
            </div>
          )}
        </div>

        {/* Step 3 - Symptoms */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>3️⃣ Select Symptoms (Multiple)</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
            {SYMPTOMS.map(s => (
              <button key={s} onClick={() => toggleSymptom(s)} style={{ padding:'7px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'inherit', background: symptoms.includes(s) ? '#DC2626' : '#F0F7F0', color: symptoms.includes(s) ? 'white' : '#1B4D2E' }}>
                {symptoms.includes(s) ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Or describe in your own words... (e.g., red spots on leaves and plant is weakening)"
            value={customText}
            onChange={e => setCustom(e.target.value)}
            rows={2}
            maxLength={300}
            style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:13, outline:'none', fontFamily:'inherit', resize:'none', boxSizing:'border-box' }}
          />
        </div>

        {/* Summary */}
        {(fasal || image || symptoms.length > 0) && (
          <div style={{ background:'#F0F7F0', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            {fasal && <span style={{ background:'#C8EDD6', color:'#1B4D2E', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700 }}>🌾 {fasal}</span>}
            {image && <span style={{ background:'#DCFCE7', color:'#16A34A', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700 }}>📸 Photo Ready</span>}
            {symptoms.length > 0 && <span style={{ background:'#FEE2E2', color:'#DC2626', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700 }}>{symptoms.length} Symptoms</span>}
          </div>
        )}

        {/* Analyze Button */}
        <button onClick={analyze} disabled={loading || !isLoggedIn} style={{
          width:'100%', padding:'15px', borderRadius:16, border:'none',
          background: (loading || !isLoggedIn) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
          color:'white', fontSize:15, fontWeight:700,
          cursor: (loading || !isLoggedIn) ? 'not-allowed' : 'pointer',
          fontFamily:'inherit', marginBottom:16,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          boxShadow: (loading || !isLoggedIn) ? 'none' : '0 6px 20px rgba(27,77,46,0.4)',
        }}>
          {loading ? (
            <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />{image ? 'Analyzing photo...' : 'AI is diagnosing...'}</>
          ) : image ? '🔬 Analyze Photo + Symptoms' : '🔬 Get Diagnosis from Symptoms'}
        </button>

        {/* Result (unchanged) */}
        {result && (
          <div style={{ background:'white', borderRadius:18, padding:'20px', boxShadow:'0 4px 20px rgba(27,77,46,0.12)', border:'1.5px solid #C8EDD6', animation:'fadeIn 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:'#1B4D2E' }}>AI Diagnosis</div>
                  <div style={{ fontSize:11, color:'#999' }}>{result.fasal} • {result.time}</div>
                </div>
              </div>
              <button onClick={reset} style={{ background:'#FEE2E2', border:'none', borderRadius:8, padding:'6px 12px', color:'#DC2626', fontSize:12, cursor:'pointer', fontWeight:600 }}>🔄 Reset</button>
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              {result.usedImage && (
                <span style={{ background:'#DCFCE7', color:'#16A34A', borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:700 }}>📸 Photo Analyzed</span>
              )}
              {result.symptoms.length > 0 && (
                <span style={{ background:'#FEE2E2', color:'#DC2626', borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:700 }}>⚠️ {result.symptoms.length} Symptoms</span>
              )}
              <span style={{ background:'#E0F2FE', color:'#0369A1', borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:700 }}>🤖 AI Powered</span>
            </div>

            {result.symptoms.length > 0 && (
              <div style={{ background:'#F8FFF8', borderRadius:10, padding:'8px 12px', marginBottom:12, display:'flex', flexWrap:'wrap', gap:6 }}>
                {result.symptoms.map((s,i) => (
                  <span key={i} style={{ background:'#C8EDD6', color:'#1B4D2E', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>{s}</span>
                ))}
              </div>
            )}

            <div style={{ background:'#F8FFF8', borderRadius:14, padding:'14px', fontSize:13, lineHeight:1.8, color:'#1a1a1a', border:'1px solid #E8F4E8', whiteSpace:'pre-wrap' }}>
              {result.text}
            </div>

            <div style={{ marginTop:12, padding:'10px 14px', background:'#FEF3C7', borderRadius:12, fontSize:12, color:'#92400E', border:'1px solid #FDE68A' }}>
              ⚠️ This is AI advice. For serious diseases or heavy damage, please consult an agriculture officer.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}