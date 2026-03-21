'use client'
import { useState } from 'react'

const UPGRADES = [
  {level:2,bp:2,poly:1800},
  {level:3,bp:3,poly:2600},
  {level:4,bp:4,poly:3400},
  {level:5,bp:5,poly:4200},
  {level:6,bp:5,poly:5000},
  {level:7,bp:6,poly:5800},
  {level:8,bp:6,poly:6600},
  {level:9,bp:7,poly:7400},
  {level:10,bp:7,poly:8200},
]

const CUMULATIVE = [
  {level:2,bp:2,poly:1800},
  {level:3,bp:5,poly:4400},
  {level:4,bp:9,poly:7800},
  {level:5,bp:14,poly:12000},
  {level:6,bp:19,poly:17000},
  {level:7,bp:25,poly:22800},
  {level:8,bp:31,poly:29400},
  {level:9,bp:38,poly:36800},
  {level:10,bp:45,poly:45000},
]

const TIERS = [
  {name:'Classic',color:'#888780',poly:8,priceMin:5,priceMax:15},
  {name:'Special',color:'#639922',poly:16,priceMin:20,priceMax:50},
  {name:'Rare',color:'#378ADD',poly:28,priceMin:60,priceMax:150},
  {name:'Elite',color:'#7F77DD',poly:40,priceMin:150,priceMax:400},
  {name:'Epic',color:'#D4537E',poly:200,priceMin:500,priceMax:2000},
  {name:'Legendary',color:'#E24B4A',poly:800,priceMin:2000,priceMax:8000},
  {name:'Ultimate',color:'#BA7517',poly:3600,priceMin:10000,priceMax:50000},
]

export default function Home() {
  const [targetLevel, setTargetLevel] = useState(10)
  const [ownedPoly, setOwnedPoly] = useState(0)

  const cumData = CUMULATIVE.find(c => c.level === targetLevel)!
  const totalPoly = cumData.poly
  const totalBp = cumData.bp
  const needPoly = Math.max(0, totalPoly - ownedPoly)

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-1">PUBG <span className="text-red-500">POLYMER</span></h1>
        <p className="text-gray-400 text-sm mb-8">คำนวณ Polymers ที่ต้องการอัพเกรดปืน</p>

        {/* ตั้งค่า */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-40">อัพเกรดไปถึง Level</label>
              <select
                value={targetLevel}
                onChange={e => setTargetLevel(parseInt(e.target.value))}
                className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none"
              >
                {[2,3,4,5,6,7,8,9,10].map(l => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-40">มี Polymers แล้ว</label>
              <input
                type="number"
                value={ownedPoly || ''}
                min={0}
                onChange={e => setOwnedPoly(parseInt(e.target.value) || 0)}
                className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* สรุป */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <div className="text-xs text-gray-400">Polymers รวม</div>
            <div className="text-xl font-bold mt-1">{totalPoly.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <div className="text-xs text-gray-400">ขาดอีก</div>
            <div className="text-xl font-bold mt-1 text-red-400">{needPoly.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <div className="text-xs text-gray-400">Blueprints รวม</div>
            <div className="text-xl font-bold mt-1">{totalBp}</div>
          </div>
        </div>

        {/* ควรซื้อ Tier ไหน */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="text-sm font-medium text-white mb-3">ควรซื้อปืน Tier ไหนมา Scrap?</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIERS.map(t => {
              const gunsNeeded = Math.ceil(needPoly / t.poly)
              const costMin = gunsNeeded * t.priceMin
              const costMax = gunsNeeded * t.priceMax
              const isZero = needPoly === 0
              return (
                <div
                  key={t.name}
                  className="bg-gray-800 rounded-xl p-3"
                  style={{ borderLeft: `3px solid ${t.color}` }}
                >
                  <div className="text-xs font-medium" style={{ color: t.color }}>{t.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.poly} Poly/อัน</div>
                  <div className="text-sm font-bold text-white mt-2">
                    {isZero ? '0 อัน' : `${gunsNeeded.toLocaleString()} อัน`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {isZero ? 'ครบแล้ว!' : `฿${costMin.toLocaleString()} – ฿${costMax.toLocaleString()}`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ตารางอัพเกรด */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="text-sm font-medium text-white mb-3">ตารางอัพเกรดแต่ละ Level</div>
          <div className="flex flex-col gap-2">
            {UPGRADES.filter(u => u.level <= targetLevel).map(u => {
              const cum = CUMULATIVE.find(c => c.level === u.level)!
              return (
                <div key={u.level} className="flex justify-between text-xs py-2 border-b border-gray-800">
                  <span className="text-gray-400">Level {u.level - 1} → {u.level}</span>
                  <span className="text-white">{u.bp} BP + {u.poly.toLocaleString()} Poly</span>
                  <span className="text-gray-500">รวม {cum.poly.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </main>
  )
}
