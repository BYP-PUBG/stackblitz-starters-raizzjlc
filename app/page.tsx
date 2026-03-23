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
const LANGS=[
  {label:'🇹🇭 ไทย',code:'TH',currency:6,symbol:'฿'},
  {label:'🇺🇸 EN',code:'EN',currency:1,symbol:'$'},
]
const TEXT={
  TH:{subtitle:'คำนวณ Polymers ที่ต้องการอัพเกรดปืน',currentLv:'ปืนอยู่ที่ Level',targetLv:'อยากอัพถึง Level',owned:'มี Polymers อยู่แล้ว',needed:'Polymers ที่ต้องการ',lacking:'ขาดอีก',bp:'Blueprints ที่ต้องการ',compare:'เปรียบเทียบทุก Tier',compareSub:'แนะนำว่าควรซื้อ Tier ไหน',compareBtn:'เปรียบเทียบ',loading:'กำลังดึง...',cheap:'ถูกสุด',best:'คุ้มสุด',mid:'กลางๆ',tierTitle:'กดที่ Tier เพื่อดูราคาปืน',table:'ตารางอัพเกรด',lowest:'ราคาต่ำสุด',listed:'วางขายอยู่',pcs:'ชิ้น',buy:'ซื้อ',total:'รวม',market:'ดูใน Steam Market →',fetching:'กำลังดึงราคา...',inMarket:'ชิ้นในตลาด',summary:'สรุป'},
  EN:{subtitle:'Calculate Polymers needed to upgrade your weapon',currentLv:'Current level',targetLv:'Target level',owned:'Polymers owned',needed:'Polymers needed',lacking:'Still need',bp:'Blueprints needed',compare:'Compare all Tiers',compareSub:'Get a recommendation instantly',compareBtn:'Compare',loading:'Loading...',cheap:'Cheapest',best:'Best value',mid:'Balanced',tierTitle:'Tap a Tier to see prices',table:'Upgrade table',lowest:'Lowest price',listed:'Listed',pcs:'pcs',buy:'Buy',total:'Total',market:'View on Steam Market →',fetching:'Fetching prices...',inMarket:'listed',summary:'Summary'},
}
interface MarketData{lowest_price:string|null;median_price:string|null;volume:string}
export default function Home(){
  const [lang,setLang]=useState(LANGS[0])
  const [currentLevel,setCurrentLevel]=useState(1)
  const [targetLevel,setTargetLevel]=useState(10)
  const [ownedPoly,setOwnedPoly]=useState<number|string>('')
  const [popup,setPopup]=useState<typeof TIERS[0]|null>(null)
  const [selectedGun,setSelectedGun]=useState('')
  const [gunPrices,setGunPrices]=useState<{name:string;price:number|null;volume:number}[]>([])
  const [loadingGuns,setLoadingGuns]=useState(false)
  const [comparing,setComparing]=useState(false)
  const [compareResults,setCompareResults]=useState<{name:string;price:number|null;volume:number;tier:typeof TIERS[0]}[]>([])
  const [loadingCompare,setLoadingCompare]=useState(false)
  const t=TEXT[lang.code as 'TH'|'EN']
  const owned=typeof ownedPoly==='string'?0:ownedPoly
  const cumTarget=CUMULATIVE.find(c=>c.level===targetLevel)!
  const cumCurrent=currentLevel>=2?CUMULATIVE.find(c=>c.level===currentLevel):null
  const totalPolyNeeded=cumTarget.poly-(cumCurrent?.poly||0)
  const totalBpNeeded=cumTarget.bp-(cumCurrent?.bp||0)
  const needPoly=Math.max(0,totalPolyNeeded-owned)

  function parsePrice(price:string|null):number|null{
    if(!price)return null
    const cleaned=price.replace(/[^0-9.,]/g,'').replace(',','.')
    const p=parseFloat(cleaned)
    return isNaN(p)||p===0?null:p
  }
  function fmt(price:number|null):string{
    if(!price)return 'N/A'
    return `${lang.symbol}${price.toFixed(2)}`
  }

  async function openPopup(tier:typeof TIERS[0]){
    setPopup(tier);setSelectedGun('');setGunPrices([]);setLoadingGuns(true)
    const results=[]
    for(const gun of tier.guns){
      try{
        const res=await fetch(`/api/market?name=${encodeURIComponent(gun)}&currency=${lang.currency}`)
        const data=await res.json()
        const price=parsePrice(data.lowest_price)
        results.push({name:gun,price,volume:parseInt(data.volume||'0')})
      }catch{results.push({name:gun,price:null,volume:0})}
    }
    results.sort((a,b)=>{if(a.price===null)return 1;if(b.price===null)return -1;return a.price-b.price})
    setGunPrices(results)
    setLoadingGuns(false)
  }

  async function compareAll(){
    setComparing(true);setLoadingCompare(true)
    const results=[]
    for(const tier of TIERS){
      try{
        const res=await fetch(`/api/market?name=${encodeURIComponent(tier.guns[0])}&currency=${lang.currency}`)
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
          <h1 className="text-2xl font-bold">PUBG <span className="text-red-500">{t.title||'POLYMER'}</span></h1>
          <div className="flex gap-2">
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>{setLang(l);setCompareResults([]);setComparing(false)}} className={`text-xs px-3 py-1 rounded-full border transition-colors ${lang.code===l.code?'bg-red-500 border-red-500 text-white':'border-gray-700 text-gray-400 hover:text-white'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-8">{t.subtitle}</p>

        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-44">{t.currentLv}</label>
              <select value={currentLevel} onChange={e=>setCurrentLevel(parseInt(e.target.value))} className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none">
                {levelOptions.filter(l=>l<10).map(l=>(<option key={l} value={l}>Level {l}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-44">{t.targetLv}</label>
              <select value={targetLevel} onChange={e=>setTargetLevel(parseInt(e.target.value))} className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none">
                {levelOptions.filter(l=>l>currentLevel).map(l=>(<option key={l} value={l}>Level {l}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-44">{t.owned}</label>
              <input type="number" value={ownedPoly} min={0} onChange={e=>setOwnedPoly(e.target.value===''?'':parseInt(e.target.value))} placeholder="0" className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm border border-gray-700 outline-none"/>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center"><div className="text-xs text-gray-400">{t.needed}</div><div className="text-xl font-bold mt-1">{totalPolyNeeded.toLocaleString()}</div></div>
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center"><div className="text-xs text-gray-400">{t.lacking}</div><div className="text-xl font-bold mt-1 text-red-400">{needPoly.toLocaleString()}</div></div>
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center"><div className="text-xs text-gray-400">{t.bp}</div><div className="text-xl font-bold mt-1">{totalBpNeeded}</div></div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div><div className="text-sm font-medium text-white">{t.compare}</div><div className="text-xs text-gray-500">{t.compareSub}</div></div>
            <button onClick={compareAll} className="text-xs px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">{loadingCompare?t.loading:t.compareBtn}</button>
          </div>
          {comparing&&!loadingCompare&&compareResults.length>0&&(
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {cheapest&&(<div className="bg-green-900 bg-opacity-30 rounded-xl p-3 border border-green-800"><div className="text-xs text-green-400 font-medium mb-1">{t.cheap}</div><div className="text-xs text-white font-medium">{cheapest.tier.name}</div><div className="text-sm font-bold text-green-400 mt-1">{fmt(Math.ceil(needPoly/cheapest.tier.poly)*(cheapest.price||0))}</div><div className="text-xs text-gray-500">{Math.ceil(needPoly/cheapest.tier.poly)} {t.pcs}</div></div>)}
                {bestValue&&(<div className="bg-blue-900 bg-opacity-30 rounded-xl p-3 border border-blue-800"><div className="text-xs text-blue-400 font-medium mb-1">{t.best}</div><div className="text-xs text-white font-medium">{bestValue.tier.name}</div><div className="text-sm font-bold text-blue-400 mt-1">{(bestValue.tier.poly/(bestValue.price||1)).toFixed(1)} Poly/{lang.symbol}</div><div className="text-xs text-gray-500">{Math.ceil(needPoly/bestValue.tier.poly)} {t.pcs}</div></div>)}
                {balanced&&(<div className="bg-purple-900 bg-opacity-30 rounded-xl p-3 border border-purple-800"><div className="text-xs text-purple-400 font-medium mb-1">{t.mid}</div><div className="text-xs text-white font-medium">{balanced.tier.name}</div><div className="text-sm font-bold text-purple-400 mt-1">{fmt(Math.ceil(needPoly/balanced.tier.poly)*(balanced.price||0))}</div><div className="text-xs text-gray-500">{Math.ceil(needPoly/balanced.tier.poly)} {t.pcs}</div></div>)}
              </div>
              <div className="flex flex-col gap-1">
                {compareResults.map(r=>{
                  const qty=Math.ceil(needPoly/r.tier.poly)
                  return(<div key={r.tier.name} className="flex items-center justify-between text-xs py-2 border-b border-gray-800"><span className="font-medium w-20" style={{color:r.tier.color}}>{r.tier.name}</span><span className="text-white">{fmt(r.price)}</span><span className="text-gray-400">{qty} {t.pcs}</span><span className="text-white font-medium">{r.price?fmt(qty*r.price):'N/A'}</span></div>)
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-800">
          <div className="text-sm font-medium text-white mb-3">{t.tierTitle}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIERS.map(tr=>{
              const qty=Math.ceil(needPoly/tr.poly)
              return(<div key={tr.name} onClick={()=>openPopup(tr)} className="bg-gray-800 rounded-xl p-3 cursor-pointer hover:-translate-y-0.5 transition-transform" style={{borderLeft:`3px solid ${tr.color}`}}><div className="text-xs font-medium" style={{color:tr.color}}>{tr.name}</div><div className="text-xs text-gray-400 mt-1">{tr.poly} Poly/{t.pcs}</div><div className="text-sm font-bold text-white mt-2">{needPoly===0?'✓':`${qty.toLocaleString()} ${t.pcs}`}</div><div className="text-xs mt-2" style={{color:tr.color}}>→</div></div>)
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="text-sm font-medium text-white mb-3">{t.table} Lv.{currentLevel} → Lv.{targetLevel}</div>
          <div className="flex flex-col gap-2">
            {UPGRADES.filter(u=>u.level>currentLevel&&u.level<=targetLevel).map(u=>{
              const cum=CUMULATIVE.find(c=>c.level===u.level)!
              return(<div key={u.level} className="flex justify-between text-xs py-2 border-b border-gray-800"><span className="text-gray-400">Lv.{u.level-1} → {u.level}</span><span className="text-white">{u.bp} BP + {u.poly.toLocaleString()} Poly</span><span className="text-gray-500">{(cum.poly-(cumCurrent?.poly||0)).toLocaleString()}</span></div>)
            })}
          </div>
        </div>
      </div>

      {popup&&(
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50" onClick={()=>setPopup(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm" style={{border:`2px solid ${popup.color}`}} onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div><h2 className="text-base font-bold" style={{color:popup.color}}>{popup.name}</h2><p className="text-xs text-gray-400 mt-1">{popup.poly} Poly/{t.pcs}</p></div>
              <button onClick={()=>setPopup(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            {loadingGuns&&(<div className="text-center text-gray-400 text-sm py-4">{t.fetching}</div>)}
            {!loadingGuns&&gunPrices.length>0&&(
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {gunPrices.map((g,idx)=>(
                  <div key={g.name} className={`rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedGun===g.name?'bg-gray-600':'bg-gray-800 hover:bg-gray-700'}`} onClick={()=>setSelectedGun(g.name)} style={idx===0?{border:`1px solid ${popup.color}`}:{}}>
                    <div className="flex items-center gap-2">
                      {idx===0&&<span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:popup.color+'33',color:popup.color}}>{t.cheap}</span>}
                      <div><div className="text-xs text-white font-medium">{g.name}</div><div className="text-xs text-gray-400 mt-0.5">{g.volume.toLocaleString()} {t.inMarket}</div></div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{fmt(g.price)}</div>
                      {g.price&&<div className="text-xs text-gray-400">{(popup.poly/g.price).toFixed(1)} Poly/{lang.symbol}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedGun&&gunPrices.find(g=>g.name===selectedGun)?.price&&(
              <div className="bg-gray-800 rounded-xl p-3 mt-2">
                <div className="text-xs text-gray-400 mb-1">{t.summary}: {selectedGun}</div>
                <div className="text-xs text-white">{t.buy} {Math.ceil(needPoly/popup.poly).toLocaleString()} {t.pcs} {t.total} {fmt(Math.ceil(needPoly/popup.poly)*(gunPrices.find(g=>g.name===selectedGun)?.price||0))}</div>
                <a href={`https://steamcommunity.com/market/listings/578080/${encodeURIComponent(selectedGun)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 block">{t.market}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
