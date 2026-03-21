export const RARITY_CONFIG = {
  mythic:    { label: 'Mythic',    border: '#D85A30', bg: '#FAECE7', text: '#993C1D', order: 0 },
  legendary: { label: 'Legendary', border: '#7F77DD', bg: '#EEEDFE', text: '#3C3489', order: 1 },
  epic:      { label: 'Epic',      border: '#378ADD', bg: '#E6F1FB', text: '#0C447C', order: 2 },
  rare:      { label: 'Rare',      border: '#639922', bg: '#EAF3DE', text: '#3B6D11', order: 3 },
  common:    { label: 'Common',    border: '#888780', bg: '#F1EFE8', text: '#5F5E5A', order: 4 },
} as const

export type Rarity = keyof typeof RARITY_CONFIG

export interface SteamItem {
  assetid: string
  name: string
  icon: string | null
  rarity: Rarity
  type: string
  tradable: boolean
}

export function toSteamId64(id: string): string {
  if (id.startsWith('765611')) return id
  return (BigInt(id) + BigInt('76561197960265728')).toString()
}

export function getRarity(tags: any[]): Rarity {
  if (!tags) return 'common'
  const tag = tags.find(t => t.category === 'Quality' || t.category === 'Rarity')
  const val = tag?.localized_tag_name?.toLowerCase() || ''
  if (val.includes('mythic'))    return 'mythic'
  if (val.includes('legendary')) return 'legendary'
  if (val.includes('epic'))      return 'epic'
  if (val.includes('rare'))      return 'rare'
  return 'common'
}

export function getType(tags: any[]): string {
  if (!tags) return 'unknown'
  return tags.find(t => t.category === 'Type')?.localized_tag_name || 'unknown'
}
