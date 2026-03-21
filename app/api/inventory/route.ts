import { NextRequest, NextResponse } from 'next/server'
import { getRarity, getType, RARITY_CONFIG } from '@/lib/steam'

const PUBG_APP_ID = 578080

export async function GET(req: NextRequest) {
  const steamId = req.nextUrl.searchParams.get('steamid')
  if (!steamId) return NextResponse.json({ error: 'Missing steamid' }, { status: 400 })

  try {
    const res = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/${PUBG_APP_ID}/2?l=english&count=5000`
    )

    if (!res.ok) return NextResponse.json({ error: 'Inventory is private or not found' }, { status: 404 })

    const data = await res.json()

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

    items.sort((a: any, b: any) =>
      (RARITY_CONFIG[a.rarity]?.order ?? 99) - (RARITY_CONFIG[b.rarity]?.order ?? 99)
    )

    return NextResponse.json({ items, total: items.length })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
