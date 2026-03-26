import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PUBG Polymer Calculator — คำนวณ Polymers อัพเกรดปืน',
  description: 'คำนวณ Polymers ที่ต้องการอัพเกรดปืน PUBG พร้อมเปรียบเทียบราคาจาก Steam Market แบบ Real-time',
  keywords: 'PUBG, Polymer, Calculator, Weapon Upgrade, Steam Market, PUBG Thailand',
  openGraph: {
    title: 'PUBG Polymer Calculator',
    description: 'คำนวณ Polymers อัพเกรดปืน PUBG พร้อมราคา Steam Market',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body style={{margin:0,padding:0,background:'#0a0a0f',minHeight:'100vh',fontFamily:'Inter, Noto Sans Thai, sans-serif'}}>
        {/* Navbar */}
        <nav style={{background:'#0f0f1a',borderBottom:'1px solid #1e1e2e',padding:'0 24px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'32px',height:'32px',background:'#E24B4A',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:'14px',color:'white'}}>P</div>
            <span style={{fontWeight:'700',fontSize:'16px',color:'white',letterSpacing:'0.05em'}}>PUBG <span style={{color:'#E24B4A'}}>POLYMER</span></span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <a href="https://steamcommunity.com/market/search?appid=578080" target="_blank" rel="noopener noreferrer" style={{fontSize:'12px',color:'#888',textDecoration:'none',padding:'6px 12px',border:'1px solid #2a2a3e',borderRadius:'20px',transition:'all 0.2s'}}>Steam Market</a>
          </div>
        </nav>

        {/* Ad Banner Top */}
<div style={{background:'#0f0f1a',borderBottom:'1px solid #1e1e2e',padding:'8px 24px',textAlign:'center'}}>
  <div style={{maxWidth:'728px',margin:'0 auto'}}>
    <a href="https://www.facebook.com/MyBoo147" target="_blank" rel="noopener noreferrer">
      <img src="/myboo-banner.jpg" alt="MyBoo PUBG PC Buy and Sell" style={{width:'100%',height:'auto',borderRadius:'8px',display:'block'}}/>
    </a>
  </div>
</div>

        {/* Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer style={{background:'#0f0f1a',borderTop:'1px solid #1e1e2e',padding:'32px 24px',marginTop:'48px'}}>
          <div style={{maxWidth:'768px',margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'24px',marginBottom:'24px'}}>
              <div>
                <div style={{fontWeight:'700',fontSize:'16px',color:'white',marginBottom:'8px'}}>PUBG <span style={{color:'#E24B4A'}}>POLYMER</span></div>
                <div style={{fontSize:'13px',color:'#666',maxWidth:'280px',lineHeight:'1.6'}}>เครื่องมือคำนวณ Polymers สำหรับอัพเกรดปืน PUBG พร้อมราคา Steam Market แบบ Real-time</div>
              </div>
              <div>
                <div style={{fontSize:'12px',color:'#888',marginBottom:'8px',fontWeight:'500'}}>ลิงก์</div>
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  <a href="https://steamcommunity.com/market/search?appid=578080" target="_blank" rel="noopener noreferrer" style={{fontSize:'13px',color:'#666',textDecoration:'none'}}>Steam Market</a>
                  <a href="https://pubg.com" target="_blank" rel="noopener noreferrer" style={{fontSize:'13px',color:'#666',textDecoration:'none'}}>PUBG Official</a>
                </div>
              </div>
              <div>
                <div style={{fontSize:'12px',color:'#888',marginBottom:'8px',fontWeight:'500'}}>ติดต่อโฆษณา</div>
                <div style={{fontSize:'13px',color:'#666'}}>สนใจลงโฆษณา</div>
                <div style={{fontSize:'13px',color:'#E24B4A',marginTop:'4px'}}>IG:dunk_ed</div>
              </div>
            </div>
            <div style={{borderTop:'1px solid #1e1e2e',paddingTop:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
              <div style={{fontSize:'12px',color:'#444'}}>© 2025 PUBG Polymer Calculator. ไม่ได้เป็นส่วนหนึ่งของ Krafton หรือ Steam</div>
              <div style={{fontSize:'12px',color:'#444'}}>ราคาจาก Steam Market อาจมีความล่าช้า</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
