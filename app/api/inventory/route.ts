import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const steamId = req.nextUrl.searchParams.get('steamid')
  
  const res = await fetch(
    `https://steamcommunity.com/inventory/${steamId}/578080/2?l=english&count=10`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
      }
    }
  )

  const text = await res.text()
  
  return NextResponse.json({ 
    status: res.status,
    ok: res.ok,
    body: text.substring(0, 500)
  })
}
```

Commit แล้วเปิด URL นี้ครับ:
```
https://pubg-inventory.vercel.app/api/inventory?steamid=76561198145644994
