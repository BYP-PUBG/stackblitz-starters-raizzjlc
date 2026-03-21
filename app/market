'use client'
import { useState } from 'react'

const WEAPONS = [
  { name: 'Silver Plate - AKM', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Silver Plate - M416', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Silver Plate - SCAR-L', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Silver Plate - SKS', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Silver Plate - AWM', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Silver Plate - DP-28', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Silver Plate - S12K', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Silver Plate - S1897', tier: 'Special', tierColor: '#639922', poly: 16 },
  { name: 'Gold Plate - AKM', tier: 'Rare', tierColor: '#378ADD', poly: 28 },
  { name: 'Gold Plate - M416', tier: 'Rare', tierColor: '#378ADD', poly: 28 },
  { name: 'Gold Plate - AWM', tier: 'Rare', tierColor: '#378ADD', poly: 28 },
  { name: 'Gold Plate - SKS', tier: 'Rare', tierColor: '#378ADD', poly: 28 },
  { name: 'Jungle Digital - M16A4', tier: 'Rare', tierColor: '#378ADD', poly: 28 },
  { name: 'Jungle Digital - SKS', tier: 'Rare', tierColor: '#378ADD', poly: 28 },
  { name: 'Gunsmith Cobalt - QBU', tier: 'Elite', tierColor: '#7F77DD', poly: 40 },
  { name: 'Gunsmith Cobalt - P1911', tier: 'Elite', tierColor: '#7F77DD', poly: 40 },
  { name: 'Gunsmith Crimson - S12K', tier: 'Elite', tierColor: '#7F77DD', poly: 40 },
  { name: 'Gunsmith Crimson - Win94', tier: 'Elite', tierColor: '#7F77DD', poly: 40 },
  { name: 'Lucky Knight - M24', tier: 'Elite', tierColor: '#7F77DD', poly: 40 },
]

interface MarketData {
  lowest_price: string | null
  median_price: string | null
  volume: string
}

export default function MarketPage() {
  const [search, setSearch] = useState('')
  const [popup, setPopup] = useState<{ name: string; tier: string; tierColor: string; poly: number } | null>(null)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = WEAPONS.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  async function openPopup(weapon: typeof WEAPONS[0]) {
    setPopup(weapon)
    setMarketData(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/market?name=${encodeURIComponent(weapon.name)}`)
      const data = await res.json()
      setMarketData(data)
    } catch {
      setMarketData({ lowest_price: null, median_price: null, volume: '0' })
    } finally {
      setLoading(false)
    }
  }

  function parsePrice(price: string | null): number {
    if (!price) return 0
    return parseFloat(price.replace(/[^0-9.]/g, ''))
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">PUBG <span className="text-red-500">MARKET</span></h1>
          <p className="text-gray-400 text-sm mt-1">ค้นหาปืนและดูราคา + stock จาก Steam Market</p>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อปืน..."
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map(w => (
            <div
              key={w.name}
              onClick={() => openPopup(w)}
              className="bg-gray-900 rounded-xl p-3 cursor-pointer hover:-translate-y-1 transition-transform"
              style={{ border: `2px solid ${w.tierColor}22` }}
            >
              <div className="text-xs font-medium text-white truncate">{w.name}</div>
              <div className="text-xs mt-1" style={{ color: w.tierColor }}>{w.tier}</div>
              <div className="text-xs text-gray-400 mt-1">{w.poly} Polymers</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-20 text-sm">ไม่พบปืนที่ค้นหา</div>
        )}
      </div>

      {/* Popup */}
      {popup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center px-4 z-50"
          onClick={() => setPopup(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm"
            style={{ border: `2px solid ${popup.tierColor}` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-base font-bold text-white">{popup.name}</h2>
                <span className="text-xs mt-1 inline-block" style={{ color: popup.tierColor }}>
                  {popup.tier} — {popup.poly} Polymers
                </span>
              </div>
              <button
                onClick={() => setPopup(null)}
                className="text-gray-500 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {loading ? (
              <div className="text-center text-gray-400 text-sm py-6">กำลังดึงราคา...</div>
            ) : marketData ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-400">ราคาต่ำสุด</div>
                    <div className="text-lg font-bold text-green-400 mt-1">
                      {marketData.lowest_price || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-400">ราคากลาง</div>
                    <div className="text-lg font-bold text-blue-400 mt-1">
                      {marketData.median_price || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400">จำนวนที่วางขายอยู่</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {parseInt(marketData.volume || '0').toLocaleString()} ชิ้น
                  </div>
                </div>

                {marketData.lowest_price && (
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-2">คุ้มค่าแค่ไหน?</div>
                    <div className="text-sm text-white">
                      ราคา <span className="text-green-400">{marketData.lowest_price}</span> → ได้ <span className="text-blue-400">{popup.poly} Polymers</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {(popup.poly / parsePrice(marketData.lowest_price)).toFixed(1)} Polymers ต่อบาท
                    </div>
                  </div>
                )}

                
                  href={`https://steamcommunity.com/market/listings/578080/${encodeURIComponent(popup.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-xs text-blue-400 hover:text-blue-300 mt-1"
                >
                  ดูใน Steam Market →
                </a>
              </div>
            ) : (
              <div className="text-center text-red-400 text-sm py-6">ดึงข้อมูลไม่ได้</div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
```

---

Commit แล้วเปิด URL นี้ดูได้เลยครับ:
```
https://pubg-inventory.vercel.app/market
