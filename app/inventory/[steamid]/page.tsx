'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SteamItem, RARITY_CONFIG, Rarity } from '@/lib/steam'

const FILTERS = ['all', 'mythic', 'legendary', 'epic', 'rare', 'common'] as const

export default function InventoryPage() {
  const { steamid } = useParams<{ steamid: string }>()
  const [items, setItems]     = useState<SteamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filter, setFilter]   = useState<string>('all')

  useEffect(() => {
    fetch(`/api/inventory?steamid=${steamid}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setItems(d.items) })
      .catch(() => setError('เกิดข้อผิดพลาด'))
      .finally(() => setLoading(false))
  }, [steamid])

  const filtered = filter === 'all' ? items : items.filter(i => i.rarity === filter)

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400 text-sm">
      กำลังโหลด inventory...
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400 text-sm">
      {error} — inventory อาจถูกตั้งเป็น Private
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">PUBG <span className="text-red-500">VAULT</span></h1>
            <p className="text-gray-400 text-sm mt-1">ไอเทมทั้งหมด {items.length} ชิ้น</p>
          </div>
          <div className="flex gap-4">
            {(Object.keys(RARITY_CONFIG) as Rarity[]).map(r => {
              const count = items.filter(i => i.rarity === r).length
              if (!count) return null
              const cfg = RARITY_CONFIG[r]
              return (
                <div key={r} className="text-center cursor-pointer" onClick={() => setFilter(r)}>
                  <div className="text-xs" style={{ color: cfg.border }}>{cfg.label}</div>
                  <div className="text-xl font-bold">{count}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filter === f
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              {f === 'all' ? 'ทั้งหมด' : RARITY_CONFIG[f as Rarity]?.label ?? f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item, idx) => {
            const cfg = RARITY_CONFIG[item.rarity]
            return (
              <div
                key={item.assetid}
                className="rounded-xl overflow-hidden hover:-translate-y-1 transition-transform"
                style={{ border: `2px solid ${cfg.border}`, background: '#111827' }}
              >
                <div className="relative aspect-square flex items-center justify-center p-2"
                  style={{ background: cfg.bg + '18' }}>
                  {item.icon
                    ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                    : <div className="text-4xl">🎮</div>
                  }
                  <span className="absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: cfg.bg, color: cfg.text }}>
                    #{idx + 1}
                  </span>
                  <span className="absolute bottom-1 right-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.text }}>
                    {cfg.label}
                  </span>
                </div>
                <div className="p-2">
                  <p className="text-xs text-white font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{item.type}</p>
                  {item.tradable && (
                    <span className="text-xs text-green-500 mt-1 block">Tradable</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-20 text-sm">ไม่พบไอเทมในหมวดนี้</div>
        )}
      </div>
    </main>
  )
}