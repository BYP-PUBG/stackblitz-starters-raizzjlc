import { NextRequest, NextResponse } from 'next/server'
import { RARITY_CONFIG } from '@/lib/steam'

const PUBG_APP_ID = 578080

function getRarityFromName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('crate')) return 'common'
  if (n.includes('gold plate') || n.includes('lucky knight')) return 'legendary'
  if (n.includes('gunsmith') || n.includes('jungle digital')) return 'epic'
  if (n.includes('silver plate') || n.includes('pgc') || n.includes('pcs')) return 'rare'
  return 'common'
}

function getTypeFromName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('crate')) return 'Crate'
  if (n.includes('pants') || n.includes('shorts')) return 'Pants'
  if (n.includes('jacket') || n.includes('hoodie') || n.includes('turtleneck') || n.includes('tank top') || n.includes('t-shirt')) return 'Top'
  if (n.includes('gloves')) return 'Gloves'
  if (n.includes('helmet')) return 'Helmet'
  if (n.includes('goggles') || n.includes('headgear')) return 'Headwear'
  if (n.includes('shoes') || n.includes('sneakers') || n.includes('boots') || n.includes('trainers') || n.includes('slippers') || n.includes('slip-ons') || n.includes('kicks')) return 'Shoes'
  if (n.includes('backpack')) return 'Backpack'
  if (n.includes('parachute')) return 'Parachute'
  if (n.includes('dacia') || n.includes('buggy') || n.includes('vehicle')) return 'Vehicle'
  if (n.includes('braces') || n.includes('watch') || n.includes('necklace')) return 'Accessory'
  if (n.includes(' - ') || n.includes('plate') || n.includes('skin')) return 'Weapon Skin'
  return 'Other'
}

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

    if (!res.ok) return NextResponse.json({ error: 'Steam error', status: res.status }, { status: 404 })

    const data = await res.json()
    if (!data || data.success === false) return NextResponse.json({ error: 'Inventory is private or not found' }, { status: 404 })

    const descMap = new Map(
      data.descriptions?.map((d: any) => [`${d.classid}_${d.instanceid}`, d])
    )

    const items = (data.assets || []).map((asset: any) => {
      const desc: any = descMap.get(`${asset.classid}_${asset.instanceid}`)
      const name = desc?.market_hash_name || desc?.name || 'Unknown'
      const rarity = getRarityFromName(name)
      const type = getTypeFromName(name)

      return {
        assetid: asset.assetid,
        name,
        icon: desc?.icon_url
          ? `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url}/128x128`
          : null,
        rarity,
        type,
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
