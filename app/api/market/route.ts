import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  try {
    const res = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=578080&currency=23&market_hash_name=${encodeURIComponent(name)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
