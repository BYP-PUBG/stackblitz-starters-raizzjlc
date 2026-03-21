'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toSteamId64 } from '@/lib/steam'

export default function Home() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      router.push(`/inventory/${toSteamId64(trimmed)}`)
    } catch {
      setError('Steam ID ไม่ถูกต้อง')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-1">
          PUBG <span className="text-red-500">VAULT</span>
        </h1>
        <p className="text-gray-500 text-sm mb-8">ดู inventory และ ranking ไอเทม PUBG ของคุณ</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            placeholder="ใส่ Steam ID64 หรือ profile URL..."
            className="bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 outline-none focus:ring-2 focus:ring-red-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-medium transition-colors"
          >
            ดู Inventory
          </button>
        </form>
        <p className="text-gray-600 text-xs mt-5">* Inventory ต้องตั้งเป็น Public ใน Steam Settings</p>
      </div>
    </main>
  )
}
