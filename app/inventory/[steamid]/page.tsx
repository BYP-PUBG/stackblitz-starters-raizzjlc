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
      .then(d => { if (d.error) setError(d.error); else setItems(d.items || []) })
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

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">PUBG <span className="text-red-500">VAULT</span></h1>
            <p className="text-gray-400 text-sm mt-1">ไอเทมทั้งหมด {items.length} ชิ้น</p>
            <div className="flex gap-2 mt-3">
              <a href="/" className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded-full px-3 py-1 transition-colors">
                หน้าหลัก
              </a>
              <a href="/market" className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded-full px-3 py-1 transition-colors">
                Steam Market
              </a>
            </div>
          </div>

          {/* Rarity summary */}
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

        {/* Filter tabs */}
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

        {/* Grid */}
        <div classNa
