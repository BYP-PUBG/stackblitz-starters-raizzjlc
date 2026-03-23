import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  const currency = req.nextUrl.searchParams.get('currency') || '6'
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  try {
    const res = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=578080&currency=${currency}&market_hash_name=${encodeURIComponent(name)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
          'Cookie': 'Steam_Language=thai; steamCountry=TH%7C; timezoneOffset=25200,0',
        },
        cache: 'no-store'
      }
    )
    const data = await res.json()
    return NextResponse.json({
      lowest_price: data.lowest_price || null,
      median_price: data.median_price || null,
      volume: data.volume || '0',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

Commit แล้วลองเปิด URL นี้ดูครับ:
```
https://pubg-inventory.vercel.app/api/market?name=Gold%20Plate%20-%20AKM&currency=6
