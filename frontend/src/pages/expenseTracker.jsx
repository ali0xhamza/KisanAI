// src/pages/ExpenseTracker.jsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORIES = [
  { value: 'beej',   label: '🌱 Seed'       },
  { value: 'khaad',  label: '🧪 Fertilizer' },
  { value: 'paani',  label: '💧 Irrigation' },
  { value: 'dawai',  label: '🌿 Pesticide'  },
  { value: 'labour', label: '👷 Labor'  },
  { value: 'other',  label: '📦 Other'     },
]

const AREA_UNITS = ['acre', 'bigha', 'marla', 'kanal']
const INCOME_UNITS = ['quintal', 'kg', 'mann', 'bag']

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function ExpenseTracker() {
  const { isLoggedIn, token } = useAuth()

  const [seasons,      setSeasons]      = useState([])
  const [activeSeason, setActiveSeason] = useState(null)
  const [expenses,     setExpenses]     = useState([])
  const [incomes,      setIncomes]      = useState([])
  const [summary,      setSummary]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState('kharcha')

  const [showSeasonForm,  setShowSeasonForm]  = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm,  setShowIncomeForm]  = useState(false)

  const [seasonForm,  setSeasonForm]  = useState({ crop_name: '', field_area: '', area_unit: 'acre', start_date: '' })
  const [expenseForm, setExpenseForm] = useState({ category: 'beej', description: '', amount: '', expense_date: today() })
  const [incomeForm,  setIncomeForm]  = useState({ source: '', quantity: '', unit: 'quintal', price_per_unit: '', total_amount: '', sale_date: today() })
  const [error, setError] = useState('')

  const hasFetched = useRef(false)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchSeasons()
  }, [])

  async function fetchSeasons() {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/expense/seasons`, { headers })
      const data = await res.json()
      setSeasons(data)
      if (data.length > 0) await selectSeason(data[0])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function selectSeason(season) {
    setActiveSeason(season)
    const [expRes, incRes, sumRes] = await Promise.all([
      fetch(`${API}/api/expense/expenses/${season.id}`, { headers }),
      fetch(`${API}/api/expense/income/${season.id}`,   { headers }),
      fetch(`${API}/api/expense/summary/${season.id}`,  { headers }),
    ])
    setExpenses(await expRes.json())
    setIncomes(await incRes.json())
    setSummary(await sumRes.json())
  }

  async function submitSeason(e) {
    e.preventDefault()
    await fetch(`${API}/api/expense/seasons`, {
      method: 'POST', headers,
      body: JSON.stringify({ ...seasonForm, field_area: parseFloat(seasonForm.field_area) }),
    })
    setShowSeasonForm(false)
    setSeasonForm({ crop_name: '', field_area: '', area_unit: 'acre', start_date: '' })
    fetchSeasons()
  }

  async function submitExpense(e) {
    e.preventDefault()
    await fetch(`${API}/api/expense/expenses`, {
      method: 'POST', headers,
      body: JSON.stringify({ ...expenseForm, season_id: activeSeason.id, amount: parseFloat(expenseForm.amount) }),
    })
    setShowExpenseForm(false)
    setExpenseForm({ category: 'beej', description: '', amount: '', expense_date: today() })
    selectSeason(activeSeason)
  }

  async function submitIncome(e) {
    e.preventDefault()
    await fetch(`${API}/api/expense/income`, {
      method: 'POST', headers,
      body: JSON.stringify({
        ...incomeForm,
        season_id:      activeSeason.id,
        total_amount:   parseFloat(incomeForm.total_amount),
        quantity:       incomeForm.quantity       ? parseFloat(incomeForm.quantity)       : null,
        price_per_unit: incomeForm.price_per_unit ? parseFloat(incomeForm.price_per_unit) : null,
      }),
    })
    setShowIncomeForm(false)
    setIncomeForm({ source: '', quantity: '', unit: 'quintal', price_per_unit: '', total_amount: '', sale_date: today() })
    selectSeason(activeSeason)
  }

  async function deleteExpense(id) {
    await fetch(`${API}/api/expense/expenses/${id}`, { method: 'DELETE', headers })
    selectSeason(activeSeason)
  }

  async function deleteIncome(id) {
    await fetch(`${API}/api/expense/income/${id}`, { method: 'DELETE', headers })
    selectSeason(activeSeason)
  }

  async function downloadPDF() {
    if (!activeSeason || !summary) return
    try {
      const res = await fetch(`${API}/api/reports/profit-loss`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          crop_name:     activeSeason.crop_name,
          field_area:    activeSeason.field_area,
          area_unit:     activeSeason.area_unit,
          start_date:    activeSeason.start_date,
          total_expense: summary.total_expense,
          total_income:  summary.total_income,
          net_profit:    summary.net_profit,
          is_profitable: summary.is_profitable,
          expenses:      expenses,
          incomes:       incomes,
        }),
      })
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `KisanAI_${activeSeason.crop_name}_Report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:36, height:36, border:'3px solid #C8EDD6', borderTop:'3px solid #1B4D2E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'52px 20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>📊</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Expense Tracker</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>Record crop expenses and income</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {!isLoggedIn && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', gap:8 }}>
            <span>⚠️</span>
            <span style={{ fontSize:13, color:'#92400E', fontWeight:600 }}>Login required to track expenses</span>
          </div>
        )}

        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'10px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>❌ {error}</div>
        )}

        {/* 1 — Season */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E' }}>1️⃣ Select Season</div>
            <button onClick={() => setShowSeasonForm(true)} style={{ background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', border:'none', borderRadius:10, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ New</button>
          </div>
          {seasons.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px 0', color:'#999', fontSize:13 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🌱</div>
              No season yet — create your first season
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {seasons.map(s => (
                <button key={s.id} onClick={() => selectSeason(s)} style={{
                  padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer',
                  fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left',
                  background: activeSeason?.id === s.id ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                  color:      activeSeason?.id === s.id ? 'white' : '#1B4D2E',
                }}>
                  🌾 {s.crop_name} — {s.field_area} {s.area_unit} · {s.start_date}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2 — Summary */}
        {summary && activeSeason && (
          <>
            <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>2️⃣ Summary</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
                <div style={{ background:'#FFF0F0', borderRadius:14, padding:'12px 8px', textAlign:'center', borderLeft:'3px solid #e53935' }}>
                  <div style={{ fontSize:11, color:'#666', marginBottom:4 }}>💸 Expense</div>
                  <div style={{ fontWeight:800, fontSize:14, color:'#e53935' }}>Rs.{summary.total_expense.toLocaleString()}</div>
                </div>
                <div style={{ background:'#F0FFF4', borderRadius:14, padding:'12px 8px', textAlign:'center', borderLeft:'3px solid #43a047' }}>
                  <div style={{ fontSize:11, color:'#666', marginBottom:4 }}>💵 Income</div>
                  <div style={{ fontWeight:800, fontSize:14, color:'#43a047' }}>Rs.{summary.total_income.toLocaleString()}</div>
                </div>
                <div style={{ background: summary.is_profitable ? '#F0FFF4' : '#FFF8E1', borderRadius:14, padding:'12px 8px', textAlign:'center', borderLeft:`3px solid ${summary.is_profitable ? '#1B4D2E' : '#ff6f00'}` }}>
                  <div style={{ fontSize:11, color:'#666', marginBottom:4 }}>{summary.is_profitable ? '✅ Profit' : '⚠️ Loss'}</div>
                  <div style={{ fontWeight:800, fontSize:14, color: summary.is_profitable ? '#1B4D2E' : '#ff6f00' }}>Rs.{Math.abs(summary.net_profit).toLocaleString()}</div>
                </div>
              </div>

              <button onClick={downloadPDF} style={{
                width:'100%', padding:'12px', borderRadius:12, border:'none',
                background:'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                color:'white', fontSize:14, fontWeight:700,
                cursor:'pointer', marginBottom:14, fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}>
                📄 Download PDF Report
              </button>

              {summary.breakdown.length > 0 && (
                <>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1B4D2E', marginBottom:8 }}>📊 Category-wise</div>
                  {summary.breakdown.map(b => (
                    <div key={b.category} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#F8FFF8', borderRadius:10, marginBottom:6, fontSize:13 }}>
                      <span>{CATEGORIES.find(c => c.value === b.category)?.label || b.category}</span>
                      <span style={{ fontWeight:700, color:'#e53935' }}>Rs.{b.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* 3 — Expense */}
            <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E' }}>3️⃣ Expense</div>
                <button onClick={() => setShowExpenseForm(true)} style={{ background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', border:'none', borderRadius:10, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add</button>
              </div>
              {expenses.length === 0 ? (
                <div style={{ textAlign:'center', padding:'14px 0', color:'#999', fontSize:13 }}>No expenses recorded</div>
              ) : expenses.map(ex => (
                <div key={ex.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'#F8FFF8', borderRadius:12, marginBottom:8, border:'1px solid #E8F4E8' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:'#1B4D2E' }}>{CATEGORIES.find(c => c.value === ex.category)?.label || ex.category}</div>
                    {ex.description && <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{ex.description}</div>}
                    <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>📅 {ex.expense_date}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontWeight:800, color:'#e53935', fontSize:14 }}>Rs.{parseFloat(ex.amount).toLocaleString()}</span>
                    <button onClick={() => deleteExpense(ex.id)} style={{ background:'#FFE5E5', border:'none', borderRadius:8, padding:'5px 8px', cursor:'pointer' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 4 — Income */}
            <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E' }}>4️⃣ Income</div>
                <button onClick={() => setShowIncomeForm(true)} style={{ background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', border:'none', borderRadius:10, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add</button>
              </div>
              {incomes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'14px 0', color:'#999', fontSize:13 }}>No income recorded</div>
              ) : incomes.map(inc => (
                <div key={inc.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'#F0FFF4', borderRadius:12, marginBottom:8, border:'1px solid #C8EDD6' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:'#1B4D2E' }}>{inc.source}</div>
                    {inc.quantity && <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{inc.quantity} {inc.unit} @ Rs.{inc.price_per_unit}</div>}
                    <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>📅 {inc.sale_date}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontWeight:800, color:'#43a047', fontSize:14 }}>Rs.{parseFloat(inc.total_amount).toLocaleString()}</span>
                    <button onClick={() => deleteIncome(inc.id)} style={{ background:'#E8F5E9', border:'none', borderRadius:8, padding:'5px 8px', cursor:'pointer' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding:'10px 14px', background:'#FEF3C7', borderRadius:12, fontSize:12, color:'#92400E', border:'1px solid #FDE68A' }}>
              ⚠️ This is a personal record. For major decisions, consult a financial advisor.
            </div>
          </>
        )}
      </div>

      {/* Season Modal */}
      {showSeasonForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:'white', borderRadius:'20px 20px 0 0', padding:'24px 20px', width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ fontWeight:800, fontSize:16, color:'#1B4D2E', marginBottom:16 }}>🌾 New Season</div>
            <form onSubmit={submitSeason}>
              <label style={lbl}>Crop name *</label>
              <input style={inp} placeholder="e.g. Wheat, Rice" required
                value={seasonForm.crop_name}
                onChange={e => setSeasonForm({ ...seasonForm, crop_name: e.target.value })} />
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10 }}>
                <div>
                  <label style={lbl}>Land area *</label>
                  <input style={inp} type="number" min="0.1" step="0.1" placeholder="e.g. 2.5" required
                    value={seasonForm.field_area}
                    onChange={e => setSeasonForm({ ...seasonForm, field_area: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Unit</label>
                  <select style={inp} value={seasonForm.area_unit}
                    onChange={e => setSeasonForm({ ...seasonForm, area_unit: e.target.value })}>
                    {AREA_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <label style={lbl}>Start date *</label>
              <input style={inp} type="date" required
                value={seasonForm.start_date}
                onChange={e => setSeasonForm({ ...seasonForm, start_date: e.target.value })} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:6 }}>
                <button type="button" onClick={() => setShowSeasonForm(false)} style={{ padding:'12px', borderRadius:12, border:'1.5px solid #ccc', background:'white', fontWeight:700, cursor:'pointer', fontSize:14 }}>Cancel</button>
                <button type="submit" style={{ padding:'12px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontWeight:700, cursor:'pointer', fontSize:14 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:'white', borderRadius:'20px 20px 0 0', padding:'24px 20px', width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ fontWeight:800, fontSize:16, color:'#1B4D2E', marginBottom:16 }}>💸 Add Expense</div>
            <form onSubmit={submitExpense}>
              <label style={lbl}>Category</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                {CATEGORIES.map(c => (
                  <button type="button" key={c.value} onClick={() => setExpenseForm({ ...expenseForm, category: c.value })} style={{
                    padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer',
                    fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left',
                    background: expenseForm.category === c.value ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                    color:      expenseForm.category === c.value ? 'white' : '#1B4D2E',
                  }}>{c.label}</button>
                ))}
              </div>
              <label style={lbl}>Details (Optional)</label>
              <input style={inp} placeholder="e.g. DAP fertilizer 1 bag"
                value={expenseForm.description}
                onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              <label style={lbl}>Amount (Rs.) *</label>
              <input style={inp} type="number" min="1" placeholder="e.g. 5000" required
                value={expenseForm.amount}
                onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              <label style={lbl}>Date *</label>
              <input style={inp} type="date" required
                value={expenseForm.expense_date}
                onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:6 }}>
                <button type="button" onClick={() => setShowExpenseForm(false)} style={{ padding:'12px', borderRadius:12, border:'1.5px solid #ccc', background:'white', fontWeight:700, cursor:'pointer', fontSize:14 }}>Cancel</button>
                <button type="submit" style={{ padding:'12px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontWeight:700, cursor:'pointer', fontSize:14 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:'white', borderRadius:'20px 20px 0 0', padding:'24px 20px', width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ fontWeight:800, fontSize:16, color:'#1B4D2E', marginBottom:16 }}>💵 Add Income</div>
            <form onSubmit={submitIncome}>
              <label style={lbl}>Source *</label>
              <input style={inp} placeholder="e.g. Market sale, Direct buyer" required
                value={incomeForm.source}
                onChange={e => setIncomeForm({ ...incomeForm, source: e.target.value })} />
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10 }}>
                <div>
                  <label style={lbl}>Quantity (Optional)</label>
                  <input style={inp} type="number" min="0" placeholder="e.g. 20"
                    value={incomeForm.quantity}
                    onChange={e => setIncomeForm({ ...incomeForm, quantity: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Unit</label>
                  <select style={inp} value={incomeForm.unit}
                    onChange={e => setIncomeForm({ ...incomeForm, unit: e.target.value })}>
                    {INCOME_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <label style={lbl}>Price per unit (Optional)</label>
              <input style={inp} type="number" min="0" placeholder="e.g. 4000"
                value={incomeForm.price_per_unit}
                onChange={e => setIncomeForm({ ...incomeForm, price_per_unit: e.target.value })} />
              <label style={lbl}>Total Amount (Rs.) *</label>
              <input style={inp} type="number" min="1" placeholder="e.g. 80000" required
                value={incomeForm.total_amount}
                onChange={e => setIncomeForm({ ...incomeForm, total_amount: e.target.value })} />
              <label style={lbl}>Date *</label>
              <input style={inp} type="date" required
                value={incomeForm.sale_date}
                onChange={e => setIncomeForm({ ...incomeForm, sale_date: e.target.value })} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:6 }}>
                <button type="button" onClick={() => setShowIncomeForm(false)} style={{ padding:'12px', borderRadius:12, border:'1.5px solid #ccc', background:'white', fontWeight:700, cursor:'pointer', fontSize:14 }}>Cancel</button>
                <button type="submit" style={{ padding:'12px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontWeight:700, cursor:'pointer', fontSize:14 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = { fontSize:12, fontWeight:700, color:'#1B4D2E', display:'block', marginBottom:6 }
const inp = { width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', marginBottom:12, boxSizing:'border-box' }