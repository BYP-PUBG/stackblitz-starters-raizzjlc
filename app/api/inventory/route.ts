import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  try {
    const [overviewRes, orderbookRes] = await Promise.all([
      fetch(
        `https://steamcommunity.com/market/priceoverview/?appid=578080&currency=23&market_hash_name=${encodeURIComponent(name)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
      ),
      fetch(
        `https://steamcommunity.com/market/itemordershistogram?country=TH&language=english&currency=23&item_nameid=0&two_factor=0`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
      )
    ])

    const overview = await overviewRes.json()

    return NextResponse.json({
      lowest_price: overview.lowest_price || null,
      median_price: overview.median_price || null,
      volume: overview.volume || '0',
      success: overview.success,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
