import { useState, useEffect } from 'react';
import { mandiAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Same DISTRICT_CITIES as user view
const DISTRICT_CITIES = {
  'Attock': ['Hasanabdal', 'Hazro'],
  'Bahawalnagar': ['BahawalNagar', 'Chistian', 'Fortabas', 'HaroonAbad', 'Minchanabad'],
  'Bahawalpur': ['AhmadPurEast', 'BahawalPur', 'HasalPur', 'Yazman', 'Khairpurtamewali'],
  'Bhakkar': ['Bhakhar', 'Kalurkot'],
  'Chakwal': ['Chakwal', 'ChuaSaidanShah', 'TalaGang'],
  'Chiniot': ['Chiniot', 'Lalian'],
  'DGKhan': ['DGKhan', 'KotChutta', 'Taunsasharif'],
  'Faisalabad': ['ChackJhumra', 'Faisalabad', 'Jaranwala', 'Mamunkanjan', 'Summandri', 'Tandlianwala'],
  'Gujranwala': ['AliPurChatta', 'Eminabad', 'Ghakhar', 'Gujranwala', 'Kamoke', 'Noshehrawirkan', 'Qiladedarsingh', 'Wazirabad'],
  'Gujrat': ['Dinga', 'Gujrat', 'JalalPurJattan', 'LalaMusa', 'Sraialamgir'],
  'Hafizabad': ['Hafizabad', 'Pindibhattian', 'Sukheke'],
  'Jhang': ['Jhang', 'Shahjewana', 'Shorkot'],
  'Jhelum': ['Jhelum', 'Pinanwal'],
  'Kasur': ['Chunian', 'Kanganpur', 'Kasur', 'Khudian', 'Kotradhakishan', 'Patoki', 'PhoolNagar'],
  'Khanewal': ['Abdulhakim', 'Jahanian', 'KabirWala', 'KachaKhu', 'Khanewal', 'MianChannu'],
  'Khushab': ['Jauharabad', 'Mithatiwana', 'Quaidabad'],
  'Lahore': ['Lahore', 'Lahore(Singhpura)', 'MultanRoadLahore', 'Kotlakhpat', 'Raiwind'],
  'Layyah': ['Fatehpur', 'Layyah'],
  'Lodhran': ['DunyaPur', 'Kahrorpacca', 'Lodhran'],
  'MandiBahaudin': ['MandiBahaudin', 'Malakwal'],
  'Mianwali': ['Mianwali', 'Piplan'],
  'Multan': ['Multan', 'Jalalpurpirwala', 'Qadirpurrawan', 'ShujaAbad'],
  'Muzaffargarh': ['Alipur', 'KotAdu', 'MuzafarGhar', 'ShahrSultan'],
  'Nankana Sb.': ['Nankana', 'Sanglahill', 'Warberten'],
  'Narowal': ['Badomalhi', 'Narowal', 'Shakargarh'],
  'Okara': ['Basirpur', 'Depalpur', 'Havelilakha', 'HujraShahmuqeem', 'Okara', 'RenalaKhurd'],
  'Pakpattan': ['ArifWala', 'PakPattan'],
  'RahimYarKhan': ['Khanpur', 'LiaqatPur', 'RahimYarKhan', 'SadiqAbad'],
  'Rajanpur': ['JamPur', 'RajanPur'],
  'Rawalpindi': ['GujarKhan', 'Rawalpindi'],
  'Sahiwal': ['Chichawatni', 'Kassowal', 'Sahiwal'],
  'Sargodha': ['Bhalwal', 'Kotmoman', 'Phularwan', 'Sargodha', 'Sillanwali'],
  'Sheikhupura': ['Farooqabad', 'Mananwala', 'Muridke', 'Narangmandi', 'Safdarabad', 'Sheikhupura'],
  'Sialkot': ['Daska', 'Pasroor', 'Sambrial', 'Sialkot'],
  'TTSingh': ['Gojra', 'Kamalia', 'PirMahal', 'TTSingh'],
  'Vehari': ['Burewala', 'Mailsi', 'Vehari'],
  'Other': ['Attock', 'Hyderabad', 'Karachi', 'Quetta', 'Gwadar', 'Murree'],
};

// Helper: infer district from city name
function getDistrictFromCity(cityName) {
  for (const [district, cities] of Object.entries(DISTRICT_CITIES)) {
    if (cities.some(c => c.toLowerCase() === cityName.toLowerCase())) {
      return district;
    }
  }
  return 'Other';
}

export default function AdminMandi() {
  const [allPrices, setAllPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDistricts, setExpandedDistricts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');   // ✅ search state
  const [newPrice, setNewPrice] = useState({
    district: '',
    city: '',
    fasal_eng: '',
    fasal_urdu: '',
    price: '',
    unit: 'Mann',
  });

  useEffect(() => {
    fetchAllPrices();
  }, []);

  async function fetchAllPrices() {
    setLoading(true);
    try {
      const data = await mandiAPI.getPrices(); // all cities
      const enriched = data.map(p => ({
        ...p,
        district: p.district || getDistrictFromCity(p.city),
      }));
      setAllPrices(enriched);
    } catch (err) {
      toast.error('Prices load failed');
    } finally {
      setLoading(false);
    }
  }

  // ✅ Group by district, then by city – and filter based on searchTerm
  const getGroupedData = () => {
    const districtMap = new Map();
    const lowerSearch = searchTerm.toLowerCase().trim();

    allPrices.forEach(item => {
      // If search term exists, check if item matches
      let matches = true;
      if (lowerSearch) {
        matches =
          item.district?.toLowerCase().includes(lowerSearch) ||
          item.city?.toLowerCase().includes(lowerSearch) ||
          item.fasal_eng?.toLowerCase().includes(lowerSearch) ||
          item.price?.toString().includes(lowerSearch);
      }
      if (!matches) return;

      const district = item.district;
      if (!districtMap.has(district)) districtMap.set(district, new Map());
      const cityMap = districtMap.get(district);
      const city = item.city;
      if (!cityMap.has(city)) cityMap.set(city, []);
      cityMap.get(city).push(item);
    });
    return districtMap;
  };

  const grouped = getGroupedData();
  const districts = Array.from(grouped.keys()).sort();

  const toggleDistrict = (district) => {
    setExpandedDistricts(prev => ({ ...prev, [district]: !prev[district] }));
  };

  const handleEdit = (price) => {
    setEditingId(price.id);
    setEditData({
      fasal_eng: price.fasal_eng,
      price: price.price,
      unit: price.unit,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await mandiAPI.updatePrice(id, editData);
      toast.success('Updated');
      setEditingId(null);
      fetchAllPrices();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this price?')) return;
    try {
      await mandiAPI.deletePrice(id);
      toast.success('Deleted');
      fetchAllPrices();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleAdd = async () => {
    if (!newPrice.district || !newPrice.city || !newPrice.fasal_eng || !newPrice.price) {
      toast.error('District, City, Crop and Price are required');
      return;
    }
    try {
      await mandiAPI.addPrice({
        city: newPrice.city,
        fasal_eng: newPrice.fasal_eng,
        fasal_urdu: newPrice.fasal_urdu || newPrice.fasal_eng,
        price: newPrice.price,
        unit: newPrice.unit,
      });
      toast.success('Price added');
      setShowAddModal(false);
      setNewPrice({ district: '', city: '', fasal_eng: '', fasal_urdu: '', price: '', unit: 'Mann' });
      fetchAllPrices();
    } catch (err) {
      toast.error('Add failed');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#e6edf3' }}>⏳ Loading mandi prices...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: '#e6edf3', fontSize: '24px', margin: 0 }}>💰 Mandi Prices</h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + Add New
        </button>
      </div>

      {/* ✅ Search Input */}
      <input
        type="text"
        placeholder="🔍 Search by district, city, crop or price..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '40px',
          border: '1px solid #30363d',
          background: '#161b22',
          color: '#fff',
          marginBottom: '24px',
          fontSize: '14px',
          outline: 'none',
        }}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Add New Price</h3>
            <select
              value={newPrice.district}
              onChange={e => setNewPrice({ ...newPrice, district: e.target.value, city: '' })}
              style={styles.input}
            >
              <option value="">Select District</option>
              {districts.map(d => <option key={d}>{d}</option>)}
            </select>
            <select
              value={newPrice.city}
              onChange={e => setNewPrice({ ...newPrice, city: e.target.value })}
              style={styles.input}
              disabled={!newPrice.district}
            >
              <option value="">Select City</option>
              {newPrice.district && DISTRICT_CITIES[newPrice.district]?.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              placeholder="Crop (English)"
              value={newPrice.fasal_eng}
              onChange={e => setNewPrice({ ...newPrice, fasal_eng: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Crop (Urdu) – optional"
              value={newPrice.fasal_urdu}
              onChange={e => setNewPrice({ ...newPrice, fasal_urdu: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Price (Rs.)"
              type="number"
              value={newPrice.price}
              onChange={e => setNewPrice({ ...newPrice, price: e.target.value })}
              style={styles.input}
            />
            <select
              value={newPrice.unit}
              onChange={e => setNewPrice({ ...newPrice, unit: e.target.value })}
              style={styles.input}
            >
              <option value="Mann">Mann</option>
              <option value="KG">KG</option>
            </select>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={handleAdd} style={styles.saveBtn}>Save</button>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* District List */}
      <div style={{ background: '#0d1117', borderRadius: '16px', padding: '8px' }}>
        {districts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
            🔍 No matching prices found
          </div>
        ) : (
          districts.map(district => {
            const cityMap = grouped.get(district);
            const totalEntries = Array.from(cityMap.values()).reduce((sum, arr) => sum + arr.length, 0);
            const isExpanded = expandedDistricts[district];
            return (
              <div key={district} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => toggleDistrict(district)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: '#161b22',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                  }}
                >
                  <span>🏘️ {district} <span style={{ fontSize: '12px', opacity: 0.7 }}>({totalEntries})</span></span>
                  <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>⌄</span>
                </button>

                {isExpanded && (
                  <div style={{ padding: '12px 8px', animation: 'fadeIn 0.2s ease' }}>
                    {Array.from(cityMap.entries()).map(([city, entries]) => (
                      <div key={city} style={{ marginBottom: '20px' }}>
                        <div style={{ color: '#86D4A0', fontWeight: 'bold', marginBottom: '10px', paddingLeft: '8px' }}>
                          📍 {city}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {entries.map(item => (
                            <div
                              key={item.id}
                              style={{
                                background: '#1a1f2e',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px',
                                border: '1px solid #2a2f3e',
                              }}
                            >
                              {editingId === item.id ? (
                                <>
                                  <input
                                    value={editData.fasal_eng}
                                    onChange={e => setEditData({ ...editData, fasal_eng: e.target.value })}
                                    style={styles.editInput}
                                  />
                                  <input
                                    type="number"
                                    value={editData.price}
                                    onChange={e => setEditData({ ...editData, price: e.target.value })}
                                    style={styles.editInput}
                                  />
                                  <select
                                    value={editData.unit}
                                    onChange={e => setEditData({ ...editData, unit: e.target.value })}
                                    style={styles.editInput}
                                  >
                                    <option value="Mann">Mann</option>
                                    <option value="KG">KG</option>
                                  </select>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => handleUpdate(item.id)} style={styles.saveSmall}>✔ Save</button>
                                    <button onClick={() => setEditingId(null)} style={styles.cancelSmall}>Cancel</button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <span style={{ fontWeight: 'bold', color: '#e6edf3' }}>{item.fasal_eng}</span>
                                    <span style={{ marginLeft: '12px', color: '#4CAF50', fontWeight: 'bold' }}>
                                      Rs. {item.price.toLocaleString()}
                                    </span>
                                    <span style={{ marginLeft: '8px', color: '#8b949e', fontSize: '12px' }}>
                                      /{item.unit || 'Mann'}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleEdit(item)} style={styles.editBtn}>✏️ Edit</button>
                                    <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#161b22',
    borderRadius: '16px',
    padding: '24px',
    width: '400px',
    border: '1px solid #30363d',
  },
  input: {
    width: '100%',
    marginBottom: '12px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #30363d',
    background: '#0d1117',
    color: '#fff',
  },
  saveBtn: {
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelBtn: {
    background: '#30363d',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  editInput: {
    background: '#0d1117',
    border: '1px solid #30363d',
    padding: '6px 10px',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    width: '120px',
  },
  saveSmall: {
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelSmall: {
    background: '#30363d',
    color: '#fff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  editBtn: {
    background: 'rgba(76,175,80,0.15)',
    color: '#4CAF50',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteBtn: {
    background: 'rgba(220,53,69,0.15)',
    color: '#ff6b6b',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

// Add fadeIn animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}