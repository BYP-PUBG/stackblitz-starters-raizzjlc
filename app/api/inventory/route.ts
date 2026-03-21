import { NextRequest, NextResponse } from 'next/server'
import { getRarity, getType, RARITY_CONFIG } from '@/lib/steam'

const PUBG_APP_ID = 578080

export async function GET(req: NextRequest) {
  const steamId = req.nextUrl.searchParams.get('steamid')
  if (!steamId) return NextResponse.json({ error: 'Missing steamid' }, { status: 400 })

  const apiKey = process.env.STEAMAPIS_KEY
  if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 500 })

  try {
    const res = await fetch(
      `https://api.steamapis.com/steam/inventory/${steamId}/${PUBG_APP_ID}/2?api_key=${apiKey}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ 
        error: 'Steam error',
        status: res.status,
        body: text.substring(0, 200)
      }, { status: 404 })
    }

    const data = await res.json()

    if (!data || data.success === false) {
      return NextResponse.json({ error: 'Inventory is private or not found' }, { status: 404 })
    }

    const descMap = new Map(
      data.descriptions?.map((d: any) => [`${d.classid}_${d.instanceid}`, d])
    )

    const items = (data.assets || []).map((asset: any) => {
      const desc: any = descMap.get(`${asset.classid}_${asset.instanceid}`)
      return {
        assetid: asset.assetid,
        name: desc?.market_hash_name || desc?.name || 'Unknown',
        icon: desc?.icon_url
          ? `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url}/128x128`
          : null,
        rarity: getRarity(desc?.tags),
        type: getType(desc?.tags),
        tradable: desc?.tradable === 1,
      }
    })

    items.sort((a: any, b: any) => {
      const orderA = (RARITY_CONFIG as any)[a.rarity]?.order ?? 99
      const orderB = (RARITY_CONFIG as any)[b.rarity]?.order ?? 99
      return orderA - orderB
    })

    return NextResponse.json({ items, total: items.length })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
