'use client'
import { useState } from 'react'

const UPGRADES=[{level:2,bp:2,poly:1800},{level:3,bp:3,poly:2600},{level:4,bp:4,poly:3400},{level:5,bp:5,poly:4200},{level:6,bp:5,poly:5000},{level:7,bp:6,poly:5800},{level:8,bp:6,poly:6600},{level:9,bp:7,poly:7400},{level:10,bp:7,poly:8200}]
const CUMULATIVE=[{level:2,bp:2,poly:1800},{level:3,bp:5,poly:4400},{level:4,bp:9,poly:7800},{level:5,bp:14,poly:12000},{level:6,bp:19,poly:17000},{level:7,bp:25,poly:22800},{level:8,bp:31,poly:29400},{level:9,bp:38,poly:36800},{level:10,bp:45,poly:45000}]
const TIERS=[
  {name:'Special',color:'#639922',poly:16,guns:['Desert Digital - Win94','Jungle Digital - M16A4','Rugged (Orange) - M416','Rugged (Orange) - AKM','Silver Plate - S1897']},
  {name:'Rare',color:'#378ADD',poly:28,guns:['Silver Plate - UMP','Toxic - S1897','Gold Plate - Sawed-Off','Gold Plate - Vector','Desert Digital - P92']},
  {name:'Elite',color:'#7F77DD',poly:40,guns:['Trifecta - SCAR-L','Gold Plate - SKS','Gold Plate - Groza','Gold Plate - AWM','Lucky Knight - SKS','Silver Plate - SCAR-L','Silver Plate - S12K','Jungle Digital - AWM','Tick Tock - QBZ','PCS3 Blue Bullion - SLR','PCS3 Tagged Out - M24']},
  {name:'Epic',color:'#D4537E',poly:200,guns:['Gold Plate - AKM','Turquoise Delight - Kar98k','Gold Plate - S12K','Shark Bite - M16A4','Turquoise Delight - M16A4','Tick Tock - M416','Glory - UMP']},
  {name:'Legendary',color:'#E24B4A',poly:800,guns:['Industrial Security - AKM','Gold Plate - S686','Shark Bite - Kar98k','Venetian - Mini14','Glory - AKM','PCS2 Fierce Conflict - G36C','PCS1 - M416','PCS1 - SKS','PCS2 Gilded Triumph - Kar98k','PCS2 Gilded Triumph - Mini14','PCS1 - QBZ']},
]
const CURRENCY_OPTIONS=[
  {label:'บาท (฿)',code:'THB',currency:6,symbol:'฿'},
  {label:'ดอลลาร์ ($)',code:'USD',currency:1,symbol:'$'},
]
interface MarketData{lowest_price:string|null;median_price:string|null;volume:string}

export default function Home(){
  const [currentLevel,setCurrentLevel]=useState(1)
  const [targetLevel,setTargetLevel]=useState(10)
  const [ownedPoly,setOwnedPoly]=useState<number|string>('')
  const [popup,setPopup]=useState<typeof TIERS[0]|null>(null)
  const [selectedGun,setSelectedGun]=useState('')
  const [marketData,setMarketData]=useState<MarketData|null>(null)
  const [loadingPrice,setLoadingPrice]=useState(false)
  const [currency,setCurrency]=useState(CURRENCY_OPTIONS[0])
  const [comparing,setComparing]=useState(false)
  const [compareResults,setCompareResults]=useState<{name:string;price:number|null;volume:number;tier:typeof TIERS[0]}[]>([])
  const [loadingCompare,setLoadingCompare]=useState(false)

  const owned=typeof ownedPoly==='string'?0:ownedPoly

  const cumTarget=CUMULATIVE.find(c=>c.level===targetLevel)!
  const cumCurrent=currentLevel>=2?CUMULATIVE.find(c=>c.level===currentLevel):null

  const totalPolyNeeded=cumTarget.poly-(cumCurrent?.poly||0)
  const totalBpNeeded=cumTarget.bp-(cumCurrent?.bp||0)
  const needPoly=Math.max(0,totalPolyNeeded-owned)

  function openPopup(tier:typeof TIERS[0]){setPopup(tier);setSelectedGun('');setMarketData(null)}

  async function fetchPrice(name:string){
    if(!name)return
    setSelectedGun(name);setMarketData(null);setLoadingPrice(true)
    try{
      const res=await fetch(`/api/market?name=${encodeURIComponent(name)}&currency=${currency.currency}`)
      const data=await res.json()
      setMarketData(data)
    }catch{setMarketData({lowest_price:null,median_price:null,volume:'0'})}
    finally{setLoadingPrice(false)}
  }

  function parsePrice(price:string|null):number|null{
    if(!price)return null
    const p=parseFloat(price.replace(/[^0-9.]/g,''))
    return isNaN(p)||p===0?null:p
  }

  async function compareAll(){
    setComparing(true)
    setLoadingCompare(true)
    const results=[]
    for(const tier of TIERS){
      try{
        const res=await fetch(`/api/market?name=${encodeURIComponent(tier.guns[0])}&currency=${currency.currency}`)
        const data=await res.json()
        const price=parsePrice(data.lowest_price)
        results.push({name:tier.guns[0],price,volume:parseInt(data.volume||'0'),tier})
      }catch{results.push({name:tier.guns[0],price:null,volume:0,tier})}
    }
    setCompareResults(results)
    setLoadingCompare(false)
  }

  const cheapest=compareResults.filter(r=>r.price).sort((a,b)=>(Math.ceil(needPoly/a.tier.poly)*(a.price||0))-(Math.ceil(needPoly/b.tier.poly)*(b.price||0)))[0]
  const bestValue=compareResults.filter(r=>r.price).sort((a,b)=>(b.tier.poly/(b.price||999))-(a.tier.poly/(a.price||999)))[0]
  const balanced=compareResults.filter(r=>r.price).sort((a,b)=>Math.ceil(needPoly/a.tier.poly)-Math.ceil(needPoly/b.tier.poly)).slice(1)[0]

  const levelOptions=Array.from({length:10},(_,i)=>i+1)

  return(
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">PUBG <span className="text-red-500">POLYMER</span></h1>
          <div className="flex gap-2">
            {CURRENCY_OPTIONS.map(c=>(
              <button key={c.code} onClick={()=>{setCurrency(c);setCompareResults([]);setComparing(false)}} className={`text-xs px-3 py-1 rounded-full border transition-colors ${currency.code===c.code?'bg-red-500 border-red-500 text-white':'border-gray-700 text-gray-400 hover:text-white'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-8">คำนวณ Polymers ที่ต้องการอัพเกรดปืน</p>

        {/* ตั้งค่า */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-44">ปืนอยู่ที่ Level ปัจจุบัน</label>
              <select value={currentLevel} onChange={e=>setCurrentLevel(parseInt(e.target.value))} className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none">
                {levelOptions.filter(l=>l<10).map(l=>(<option key={l} value={l}>Level {l}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-44">อยากอัพไปถึง Level</label>
              <select value={targetLevel} onChange={e=>setTargetLevel(parseInt(e.target.value))} className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none">
                {levelOptions.filter(l=>l>currentLevel).map(l=>(<option key={l} value={l}>Level {l}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-44">มี Polymers อยู่แล้ว</label>
              <input type="number" value={ownedPoly} min={0} onChange={e=>setOwnedPoly(e.target.value===''?'':parseInt(e.target.value))} placeholder="0" className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none"/>
            </div>
          </div>
        </div>

        {/* สรุป */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <div className="text-xs text-gray-400">Polymers ที่ต้องการ</div>
            <div className="text-xl font-bold mt-1">{totalPolyNeeded.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <div className="text-xs text-gray-400">ขาดอีก</div>
            <div className="text-xl font-bold mt-1 text-red-400">{needPoly.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <div className="text-xs text-gray-400">Blueprints ที่ต้องการ</div>
            <div className="text-xl font-bold mt-1">{totalBpNeeded}</div>
          </div>
        </div>

        {/* เปรียบเทียบ */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-white">เปรียบเทียบทุก Tier</div>
              <div className="text-xs text-gray-500">แนะนำให้เลยว่าควรซื้อ Tier ไหน</div>
            </div>
            <button onClick={compareAll} className="text-xs px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">
              {loadingCompare?'กำลังดึง...':'เปรียบเทียบ'}
            </button>
          </div>

          {comparing&&!loadingCompare&&compareResults.length>0&&(
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {cheapest&&(
                  <div className="bg-green-900 bg-opacity-30 rounded-xl p-3 border border-green-800">
                    <div className="text-xs text-green-400 font-medium mb-1">ถูกสุด</div>
                    <div className="text-xs text-white font-medium">{cheapest.tier.name}</div>
                    <div className="text-sm font-bold text-green-400 mt-1">{currency.symbol}{(Math.ceil(needPoly/cheapest.tier.poly)*(cheapest.price||0)).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                    <div className="text-xs text-gray-500">{Math.ceil(needPoly/cheapest.tier.poly)} อัน</div>
                  </div>
                )}
                {bestValue&&(
                  <div className="bg-blue-900 bg-opacity-30 rounded-xl p-3 border border-blue-800">
                    <div className="text-xs text-blue-400 font-medium mb-1">คุ้มสุด</div>
                    <div className="text-xs text-white font-medium">{bestValue.tier.name}</div>
                    <div className="text-sm font-bold text-blue-400 mt-1">{(bestValue.tier.poly/(bestValue.price||1)).toFixed(1)} Poly/{currency.symbol}</div>
                    <div className="text-xs text-gray-500">{Math.ceil(needPoly/bestValue.tier.poly)} อัน</div>
                  </div>
                )}
                {balanced&&(
                  <div className="bg-purple-900 bg-opacity-30 rounded-xl p-3 border border-purple-800">
                    <div className="text-xs text-purple-400 font-medium mb-1">กลางๆ</div>
                    <div className="text-xs text-white font-medium">{balanced.tier.name}</div>
                    <div className="text-sm font-bold text-purple-400 mt-1">{currency.symbol}{(Math.ceil(needPoly/balanced.tier.poly)*(balanced.price||0)).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                    <div className="text-xs text-gray-500">{Math.ceil(needPoly/balanced.tier.poly)} อัน</div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {compareResults.map(r=>{
                  const qty=Math.ceil(needPoly/r.tier.poly)
                  const total=qty*(r.price||0)
                  return(
                    <div key={r.tier.name} className="flex items-center justify-between text-xs py-2 border-b border-gray-800">
                      <span className="font-medium w-20" style={{color:r.tier.color}}>{r.tier.name}</span>
                      <span className="text-white">{r.price?`${currency.symbol}${r.price}`:'N/A'}</span>
                      <span className="text-gray-400">{qty} อัน</span>
                      <span className="text-white font-medium">{r.price?`${currency.symbol}${total.toLocaleString(undefined,{maximumFractionDigits:0})}`:'N/A'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tier cards */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="text-sm font-medium text-white mb-3">กดที่ Tier เพื่อดูราคาปืน</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIERS.map(t=>{
              const qty=Math.ceil(needPoly/t.poly)
              return(
                <div key={t.name} onClick={()=>openPopup(t)} className="bg-gray-800 rounded-xl p-3 cursor-pointer hover:-translate-y-0.5 transition-transform" style={{borderLeft:`3px solid ${t.color}`}}>
                  <div className="text-xs font-medium" style={{color:t.color}}>{t.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.poly} Poly/อัน</div>
                  <div className="text-sm font-bold text-white mt-2">{needPoly===0?'ครบแล้ว!':`${qty.toLocaleString()} อัน`}</div>
                  <div className="text-xs mt-2" style={{color:t.color}}>ดูราคา →</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ตารางอัพเกรด */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="text-sm font-medium text-white mb-3">ตารางอัพเกรด Level {currentLevel} → {targetLevel}</div>
          <div className="flex flex-col gap-2">
            {UPGRADES.filter(u=>u.level>currentLevel&&u.level<=targetLevel).map(u=>{
              const cum=CUMULATIVE.find(c=>c.level===u.level)!
              return(<div key={u.level} className="flex justify-between text-xs py-2 border-b border-gray-800"><span className="text-gray-400">Level {u.level-1} → {u.level}</span><span className="text-white">{u.bp} BP + {u.poly.toLocaleString()} Poly</span><span className="text-gray-500">รวม {(cum.poly-(cumCurrent?.poly||0)).toLocaleString()}</span></div>)
            })}
          </div>
        </div>
      </div>

      {/* Popup */}
      {popup&&(
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50" onClick={()=>setPopup(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm" style={{border:`2px solid ${popup.color}`}} onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div><h2 className="text-base font-bold" style={{color:popup.color}}>{popup.name}</h2><p className="text-xs text-gray-400 mt-1">{popup.poly} Polymers/อัน</p></div>
              <button onClick={()=>setPopup(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            <select value={selectedGun} onChange={e=>fetchPrice(e.target.value)} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none mb-4">
              <option value="">เลือกปืนเพื่อดูราคา...</option>
              {popup.guns.map(g=>(<option key={g} value={g}>{g}</option>))}
            </select>
            {loadingPrice&&(<div className="text-center text-gray-400 text-sm py-4">กำลังดึงราคา...</div>)}
            {!loadingPrice&&marketData&&(
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800 rounded-xl p-3 text-center"><div className="text-xs text-gray-400">ราคาต่ำสุด</div><div className="text-lg font-bold text-green-400 mt-1">{marketData.lowest_price||'N/A'}</div></div>
                  <div className="bg-gray-800 rounded-xl p-3 text-center"><div className="text-xs text-gray-400">วางขายอยู่</div><div className="text-lg font-bold text-white mt-1">{parseInt(marketData.volume||'0').toLocaleString()} ชิ้น</div></div>
                </div>
                {marketData.lowest_price&&(
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-2">สรุป</div>
                    <div className="text-sm text-white">{(popup.poly/parseFloat(marketData.lowest_price.replace(/[^0-9.]/g,''))).toFixed(1)} Poly/{currency.symbol}</div>
                    <div className="text-xs text-gray-400 mt-1">ซื้อ {Math.ceil(needPoly/popup.poly).toLocaleString()} อัน รวม {currency.symbol}{(Math.ceil(needPoly/popup.poly)*parseFloat(marketData.lowest_price.replace(/[^0-9.]/g,''))).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                  </div>
                )}
                <a href={`https://steamcommunity.com/market/listings/578080/${encodeURIComponent(selectedGun)}`} target="_blank" rel="noopener noreferrer" className="text-center text-xs text-blue-400 hover:text-blue-300">ดูใน Steam Market →</a>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
