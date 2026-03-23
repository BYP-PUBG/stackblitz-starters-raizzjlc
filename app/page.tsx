'use client'
import React, { useState } from 'react'

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
  {label:'🇹🇭 ไทย',code:'TH',currency:1,symbol:'฿',rate:33},
  {label:'🇺🇸 EN',code:'EN',currency:1,symbol:'$',rate:1},
]
const TEXT={
  TH:{subtitle:'คำนวณ Polymers ที่ต้องการอัพเกรดปืน พร้อมเปรียบเทียบราคาจาก Steam Market',currentLv:'ปืนอยู่ที่ Level',targetLv:'อยากอัพถึง Level',owned:'มี Polymers อยู่แล้ว',needed:'Polymers ที่ต้องการ',lacking:'ขาดอีก',bp:'Blueprints',compare:'เปรียบเทียบทุก Tier',compareSub:'ดึงราคาจาก Steam Market แบบ Real-time',compareBtn:'เปรียบเทียบ',loading:'กำลังดึงข้อมูล...',s1:'Strategy 1 — คุ้มสุด',s1sub:'ซื้อ Tier เดียวที่ได้ Poly/บาทดีสุด',s2:'Strategy 2 — ผสม 70/30',s2sub:'ถูก 70% + แพงกว่า 30%',s3:'Strategy 3 — ผสม 40/60',s3sub:'ถูก 40% + แพงกว่า 60%',tierTitle:'เลือก Tier เพื่อดูราคาปืน',table:'ตารางอัพเกรด',pcs:'ชิ้น',buy:'ซื้อ',total:'รวม',market:'ดูใน Steam Market →',fetching:'กำลังดึงราคา...',inMarket:'ชิ้นในตลาด',summary:'สรุป',totalCost:'ราคารวม',qty:'จำนวน',ppb:'Poly/บาท'},
  EN:{subtitle:'Calculate Polymers to upgrade your PUBG weapon with real-time Steam Market prices',currentLv:'Current weapon level',targetLv:'Target level',owned:'Polymers owned',needed:'Polymers needed',lacking:'Still need',bp:'Blueprints',compare:'Compare all Tiers',compareSub:'Pulls real-time prices from Steam Market',compareBtn:'Compare',loading:'Fetching data...',s1:'Strategy 1 — Best value',s1sub:'One Tier with best Poly/price ratio',s2:'Strategy 2 — Mix 70/30',s2sub:'Cheap 70% + Pricier 30%',s3:'Strategy 3 — Mix 40/60',s3sub:'Cheap 40% + Pricier 60%',tierTitle:'Select a Tier to see gun prices',table:'Upgrade table',pcs:'pcs',buy:'Buy',total:'Total',market:'View on Steam Market →',fetching:'Fetching prices...',inMarket:'listed',summary:'Summary',totalCost:'Total cost',qty:'Qty',ppb:'Poly/price'},
}
interface CompareResult{name:string;price:number|null;volume:number;tier:typeof TIERS[0]}
const card={background:'#0f0f1a',border:'1px solid #1e1e2e',borderRadius:'16px',padding:'20px'} as React.CSSProperties
const cardSm={background:'#0f0f1a',border:'1px solid #1e1e2e',borderRadius:'12px',padding:'16px'} as React.CSSProperties
const inp={width:'100%',background:'#1a1a2e',color:'white',border:'1px solid #2a2a3e',borderRadius:'10px',padding:'10px 14px',fontSize:'14px',outline:'none',boxSizing:'border-box'} as React.CSSProperties

function mktUrl(name:string){return`https://steamcommunity.com/market/listings/578080/${encodeURIComponent(name)}`}

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
  const [compareResults,setCompareResults]=useState<CompareResult[]>([])
  const [loadingCompare,setLoadingCompare]=useState(false)

  const t=TEXT[lang.code as 'TH'|'EN']
  const owned=typeof ownedPoly==='string'?0:ownedPoly
  const cumTarget=CUMULATIVE.find(c=>c.level===targetLevel)!
  const cumCurrent=currentLevel>=2?CUMULATIVE.find(c=>c.level===currentLevel):null
  const totalPolyNeeded=cumTarget.poly-(cumCurrent?.poly||0)
  const totalBpNeeded=cumTarget.bp-(cumCurrent?.bp||0)
  const needPoly=Math.max(0,totalPolyNeeded-owned)

  function parsePrice(p:string|null):number|null{
    if(!p)return null
    const n=parseFloat(p.replace(/[^0-9.]/g,''))
    return isNaN(n)||n===0?null:n
  }
  function fmt(n:number|null):string{
    if(!n)return 'N/A'
    return `${lang.symbol}${(n*lang.rate).toFixed(2)}`
  }

  async function openPopup(tier:typeof TIERS[0]){
    setPopup(tier);setSelectedGun('');setGunPrices([]);setLoadingGuns(true)
    const res=[]
    for(const gun of tier.guns){
      try{
        const r=await fetch(`/api/market?name=${encodeURIComponent(gun)}&currency=${lang.currency}`)
        const d=await r.json()
        res.push({name:gun,price:parsePrice(d.lowest_price),volume:parseInt(d.volume||'0')})
      }catch{res.push({name:gun,price:null,volume:0})}
    }
    res.sort((a,b)=>{if(a.price===null)return 1;if(b.price===null)return -1;return a.price-b.price})
    setGunPrices(res);setLoadingGuns(false)
  }

  async function compareAll(){
    setComparing(true);setLoadingCompare(true)
    const res:CompareResult[]=[]
    for(const tier of TIERS){
      try{
        const r=await fetch(`/api/market?name=${encodeURIComponent(tier.guns[0])}&currency=${lang.currency}`)
        const d=await r.json()
        res.push({name:tier.guns[0],price:parsePrice(d.lowest_price),volume:parseInt(d.volume||'0'),tier})
      }catch{res.push({name:tier.guns[0],price:null,volume:0,tier})}
    }
    setCompareResults(res);setLoadingCompare(false)
  }

  const valid=[...compareResults].filter(r=>r.price&&r.price>0)
  const byVal=[...valid].sort((a,b)=>(b.tier.poly/(b.price||999))-(a.tier.poly/(a.price||999)))
  const best=byVal[0],second=byVal[1]

  function s1(){
    if(!best)return null
    const qty=Math.ceil(needPoly/best.tier.poly)
    const cost=qty*(best.price||0)
    return{r:best,qty,cost,ppb:needPoly/cost}
  }
  function mix(r:number){
    if(!best||!second)return null
    const q1=Math.ceil(needPoly*r/best.tier.poly)
    const q2=Math.ceil(needPoly*(1-r)/second.tier.poly)
    const cost=q1*(best.price||0)+q2*(second.price||0)
    return{r1:best,r2:second,q1,q2,qty:q1+q2,cost,ppb:needPoly/cost}
  }
  const rs1=s1(),rs2=mix(0.7),rs3=mix(0.4)
  const levels=Array.from({length:10},(_,i)=>i+1)

  function MktBtn({name,color,label}:{name:string,color:string,label:string}){
    return(
      <a href={mktUrl(name)} target="_blank" rel="noopener noreferrer"
        style={{flex:1,textAlign:'center' as const,fontSize:'12px',color,textDecoration:'none',padding:'8px',background:`${color}22`,borderRadius:'8px',display:'block'}}>
        {label} →
      </a>
    )
  }

  return(
    <div style={{maxWidth:'720px',margin:'0 auto',padding:'24px 16px'}}>
      <div style={{marginBottom:'24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
          <h1 style={{fontSize:'28px',fontWeight:'800',color:'white',margin:0,letterSpacing:'-0.02em'}}>PUBG <span style={{color:'#E24B4A'}}>POLYMER</span></h1>
          <div style={{display:'flex',gap:'6px'}}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>{setLang(l);setCompareResults([]);setComparing(false)}}
                style={{fontSize:'12px',padding:'6px 12px',borderRadius:'20px',border:'none',cursor:'pointer',fontWeight:'600',background:lang.code===l.code?'#E24B4A':'#1a1a2e',color:lang.code===l.code?'white':'#888'}}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <p style={{color:'#666',fontSize:'13px',margin:0}}>{t.subtitle}</p>
      </div>

      <div style={{...cardSm,marginBottom:'16px',textAlign:'center'}}>
        <div style={{height:'60px',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:'#333',fontSize:'11px',letterSpacing:'0.1em'}}>ADVERTISEMENT</span>
        </div>
      </div>

      <div style={{...card,marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#E24B4A',marginBottom:'16px',letterSpacing:'0.05em'}}>ตั้งค่าการอัพเกรด</div>
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {[{label:t.currentLv,val:currentLevel,onChange:(v:number)=>setCurrentLevel(v),opts:levels.filter(l=>l<10)},
            {label:t.targetLv,val:targetLevel,onChange:(v:number)=>setTargetLevel(v),opts:levels.filter(l=>l>currentLevel)}
          ].map(f=>(
            <div key={f.label} style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <label style={{fontSize:'13px',color:'#888',minWidth:'160px'}}>{f.label}</label>
              <select value={f.val} onChange={e=>f.onChange(parseInt(e.target.value))} style={inp}>
                {f.opts.map(l=>(<option key={l} value={l}>Level {l}</option>))}
              </select>
            </div>
          ))}
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <label style={{fontSize:'13px',color:'#888',minWidth:'160px'}}>{t.owned}</label>
            <input type="number" value={ownedPoly} min={0} onChange={e=>setOwnedPoly(e.target.value===''?'':parseInt(e.target.value))} placeholder="0" style={inp}/>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
        {[{label:t.needed,val:totalPolyNeeded.toLocaleString(),color:'white'},{label:t.lacking,val:needPoly.toLocaleString(),color:'#E24B4A'},{label:t.bp,val:totalBpNeeded.toString(),color:'white'}].map(s=>(
          <div key={s.label} style={{...cardSm,textAlign:'center'}}>
            <div style={{fontSize:'11px',color:'#666',marginBottom:'6px'}}>{s.label}</div>
            <div style={{fontSize:'22px',fontWeight:'800',color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{...card,marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px'}}>
          <div>
            <div style={{fontSize:'14px',fontWeight:'700',color:'white'}}>{t.compare}</div>
            <div style={{fontSize:'12px',color:'#555',marginTop:'2px'}}>{t.compareSub}</div>
          </div>
          <button onClick={compareAll} style={{fontSize:'13px',padding:'8px 18px',background:'#E24B4A',color:'white',border:'none',borderRadius:'20px',cursor:'pointer',fontWeight:'600',opacity:loadingCompare?0.7:1}}>
            {loadingCompare?t.loading:t.compareBtn}
          </button>
        </div>

        {comparing&&!loadingCompare&&compareResults.length>0&&(
          <div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>

            {rs1&&(
              <div style={{background:'rgba(99,153,34,0.1)',border:'1px solid rgba(99,153,34,0.3)',borderRadius:'12px',padding:'14px'}}>
                <div style={{fontSize:'12px',color:'#639922',fontWeight:'700',marginBottom:'2px'}}>{t.s1}</div>
                <div style={{fontSize:'11px',color:'#555',marginBottom:'10px'}}>{t.s1sub}</div>
                <div style={{fontSize:'12px',color:'#aaa',marginBottom:'10px'}}>ซื้อ <span style={{color:rs1.r.tier.color,fontWeight:'600'}}>{rs1.r.tier.name}</span> {rs1.qty} {t.pcs}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',textAlign:'center',marginBottom:'12px'}}>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.totalCost}</div><div style={{fontSize:'15px',fontWeight:'700',color:'#639922'}}>{fmt(rs1.cost)}</div></div>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.qty}</div><div style={{fontSize:'15px',fontWeight:'700',color:'white'}}>{rs1.qty} {t.pcs}</div></div>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.ppb}</div><div style={{fontSize:'15px',fontWeight:'700',color:'white'}}>{rs1.ppb.toFixed(1)}</div></div>
                </div>
                <MktBtn name={rs1.r.name} color='#639922' label={`ดู ${rs1.r.tier.name} ใน Steam Market`}/>
              </div>
            )}

            {rs2&&(
              <div style={{background:'rgba(55,138,221,0.1)',border:'1px solid rgba(55,138,221,0.3)',borderRadius:'12px',padding:'14px'}}>
                <div style={{fontSize:'12px',color:'#378ADD',fontWeight:'700',marginBottom:'2px'}}>{t.s2}</div>
                <div style={{fontSize:'11px',color:'#555',marginBottom:'10px'}}>{t.s2sub}</div>
                <div style={{fontSize:'12px',color:'#aaa',marginBottom:'10px'}}>
                  <span style={{color:rs2.r1.tier.color,fontWeight:'600'}}>{rs2.r1.tier.name}</span> {rs2.q1} + <span style={{color:rs2.r2.tier.color,fontWeight:'600'}}>{rs2.r2.tier.name}</span> {rs2.q2} {t.pcs}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',textAlign:'center',marginBottom:'12px'}}>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.totalCost}</div><div style={{fontSize:'15px',fontWeight:'700',color:'#378ADD'}}>{fmt(rs2.cost)}</div></div>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.qty}</div><div style={{fontSize:'15px',fontWeight:'700',color:'white'}}>{rs2.qty} {t.pcs}</div></div>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.ppb}</div><div style={{fontSize:'15px',fontWeight:'700',color:'white'}}>{rs2.ppb.toFixed(1)}</div></div>
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <MktBtn name={rs2.r1.name} color='#378ADD' label={`ดู ${rs2.r1.tier.name}`}/>
                  <MktBtn name={rs2.r2.name} color='#378ADD' label={`ดู ${rs2.r2.tier.name}`}/>
                </div>
              </div>
            )}

            {rs3&&(
              <div style={{background:'rgba(127,119,221,0.1)',border:'1px solid rgba(127,119,221,0.3)',borderRadius:'12px',padding:'14px'}}>
                <div style={{fontSize:'12px',color:'#7F77DD',fontWeight:'700',marginBottom:'2px'}}>{t.s3}</div>
                <div style={{fontSize:'11px',color:'#555',marginBottom:'10px'}}>{t.s3sub}</div>
                <div style={{fontSize:'12px',color:'#aaa',marginBottom:'10px'}}>
                  <span style={{color:rs3.r1.tier.color,fontWeight:'600'}}>{rs3.r1.tier.name}</span> {rs3.q1} + <span style={{color:rs3.r2.tier.color,fontWeight:'600'}}>{rs3.r2.tier.name}</span> {rs3.q2} {t.pcs}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',textAlign:'center',marginBottom:'12px'}}>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.totalCost}</div><div style={{fontSize:'15px',fontWeight:'700',color:'#7F77DD'}}>{fmt(rs3.cost)}</div></div>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.qty}</div><div style={{fontSize:'15px',fontWeight:'700',color:'white'}}>{rs3.qty} {t.pcs}</div></div>
                  <div><div style={{fontSize:'11px',color:'#555'}}>{t.ppb}</div><div style={{fontSize:'15px',fontWeight:'700',color:'white'}}>{rs3.ppb.toFixed(1)}</div></div>
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <MktBtn name={rs3.r1.name} color='#7F77DD' label={`ดู ${rs3.r1.tier.name}`}/>
                  <MktBtn name={rs3.r2.name} color='#7F77DD' label={`ดู ${rs3.r2.tier.name}`}/>
                </div>
              </div>
            )}

            <div style={{borderTop:'1px solid #1e1e2e',paddingTop:'12px',display:'flex',flexDirection:'column',gap:'2px'}}>
              {compareResults.map(r=>{
                const qty=Math.ceil(needPoly/r.tier.poly)
                return(
                  <div key={r.tier.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #141420',fontSize:'13px'}}>
                    <span style={{color:r.tier.color,fontWeight:'600',width:'80px'}}>{r.tier.name}</span>
                    <span style={{color:'#888'}}>{fmt(r.price)}</span>
                    <span style={{color:'#666'}}>{qty} {t.pcs}</span>
                    <span style={{color:'white',fontWeight:'600'}}>{r.price?fmt(qty*r.price):'-'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{...card,marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#E24B4A',marginBottom:'16px',letterSpacing:'0.05em'}}>{t.tierTitle}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
          {TIERS.map(tr=>{
            const qty=Math.ceil(needPoly/tr.poly)
            return(
              <div key={tr.name} onClick={()=>openPopup(tr)} style={{background:'#1a1a2e',borderRadius:'12px',padding:'14px',cursor:'pointer',borderLeft:`3px solid ${tr.color}`}}>
                <div style={{fontSize:'12px',fontWeight:'700',color:tr.color,marginBottom:'4px'}}>{tr.name}</div>
                <div style={{fontSize:'11px',color:'#555',marginBottom:'8px'}}>{tr.poly} Poly/{t.pcs}</div>
                <div style={{fontSize:'18px',fontWeight:'800',color:'white'}}>{needPoly===0?'✓':`${qty.toLocaleString()}`}</div>
                <div style={{fontSize:'11px',color:'#555',marginTop:'2px'}}>{needPoly===0?'ครบแล้ว':t.pcs} · ดูราคา →</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{...cardSm,marginBottom:'16px',textAlign:'center'}}>
        <div style={{height:'60px',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:'#333',fontSize:'11px',letterSpacing:'0.1em'}}>ADVERTISEMENT</span>
        </div>
      </div>

      <div style={{...card}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#E24B4A',marginBottom:'16px',letterSpacing:'0.05em'}}>{t.table} Lv.{currentLevel} → Lv.{targetLevel}</div>
        <div style={{display:'flex',flexDirection:'column'}}>
          {UPGRADES.filter(u=>u.level>currentLevel&&u.level<=targetLevel).map(u=>{
            const cum=CUMULATIVE.find(c=>c.level===u.level)!
            return(
              <div key={u.level} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #141420',fontSize:'13px'}}>
                <span style={{color:'#666'}}>Lv.{u.level-1} → {u.level}</span>
                <span style={{color:'#888'}}>{u.bp} BP + {u.poly.toLocaleString()} Poly</span>
                <span style={{color:'white',fontWeight:'600'}}>{(cum.poly-(cumCurrent?.poly||0)).toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      </div>
</div>
</div>

<div style={{
  ...cardSm,
  marginTop:'20px',
  textAlign:'center',
  border:'1px solid #2a2a3e',
  background:'linear-gradient(145deg, #0f0f1a, #151527)',
  boxShadow:'0 0 20px rgba(226,75,74,0.15)'
}}>
  <div style={{
    fontSize:'13px',
    color:'#E24B4A',
    marginBottom:'12px',
    fontWeight:'700'
  }}>
    📢 ติดต่อโฆษณา / Contact
  </div>

  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>

    <a 
      href="https://www.instagram.com/dunk_ed?igsh=bGJ6ajl4bXAzbTRr&utm_source=qr"
      target="_blank"
      style={{
        padding:'10px',
        borderRadius:'10px',
        background:'linear-gradient(90deg,#833ab4,#fd1d1d,#fcb045)',
        color:'white',
        textDecoration:'none'
      }}
    >
      📸 Instagram: @dunk_ed
    </a>

    <a 
      href="mailto:ppkk5811@gmail.com"
      style={{
        padding:'10px',
        borderRadius:'10px',
        background:'#1a1a2e',
        color:'#378ADD',
        textDecoration:'none',
        border:'1px solid #2a2a3e'
      }}
    >
      ✉️ Email: ppkk5811@gmail.com
    </a>

  </div>
</div>
{popup&&(
      {popup&&(
        <div onClick={()=>setPopup(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',zIndex:200}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#0f0f1a',border:`1px solid ${popup.color}`,borderRadius:'20px',padding:'24px',width:'100%',maxWidth:'400px',maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div>
                <h2 style={{fontSize:'18px',fontWeight:'800',color:popup.color,margin:0}}>{popup.name}</h2>
                <p style={{fontSize:'12px',color:'#666',margin:'4px 0 0'}}>{popup.poly} Polymers/{t.pcs}</p>
              </div>
              <button onClick={()=>setPopup(null)} style={{background:'#1a1a2e',border:'none',color:'#888',fontSize:'18px',width:'32px',height:'32px',borderRadius:'8px',cursor:'pointer'}}>×</button>
            </div>
            {loadingGuns&&(<div style={{textAlign:'center',color:'#666',fontSize:'13px',padding:'24px'}}>{t.fetching}</div>)}
            {!loadingGuns&&gunPrices.length>0&&(
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {gunPrices.map((g,idx)=>(
                  <div key={g.name} onClick={()=>setSelectedGun(g.name)}
                    style={{background:selectedGun===g.name?'#2a2a3e':'#1a1a2e',borderRadius:'12px',padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',border:idx===0?`1px solid ${popup.color}`:'1px solid transparent'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      {idx===0&&<span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'10px',background:popup.color+'33',color:popup.color,fontWeight:'700'}}>ถูกสุด</span>}
                      <div>
                        <div style={{fontSize:'13px',color:'white',fontWeight:'500'}}>{g.name}</div>
                        <div style={{fontSize:'11px',color:'#555',marginTop:'2px'}}>{g.volume.toLocaleString()} {t.inMarket}</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'15px',fontWeight:'700',color:'#4ade80'}}>{fmt(g.price)}</div>
                      {g.price&&<div style={{fontSize:'11px',color:'#555'}}>{(popup.poly/g.price).toFixed(1)} Poly/{lang.symbol}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedGun&&gunPrices.find(g=>g.name===selectedGun)?.price&&(
              <div style={{background:'#1a1a2e',borderRadius:'12px',padding:'14px',marginTop:'12px'}}>
                <div style={{fontSize:'11px',color:'#666',marginBottom:'6px'}}>{t.summary}: {selectedGun}</div>
                <div style={{fontSize:'13px',color:'white',marginBottom:'8px'}}>
                  {t.buy} {Math.ceil(needPoly/popup.poly).toLocaleString()} {t.pcs} · {t.total} <span style={{color:'#4ade80',fontWeight:'700'}}>{fmt(Math.ceil(needPoly/popup.poly)*(gunPrices.find(g=>g.name===selectedGun)?.price||0))}</span>
                </div>
                <a href={mktUrl(selectedGun)} target="_blank" rel="noopener noreferrer"
                  style={{display:'block',textAlign:'center',fontSize:'12px',color:'#378ADD',textDecoration:'none',padding:'8px',background:'rgba(55,138,221,0.15)',borderRadius:'8px'}}>
                  {t.market}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
