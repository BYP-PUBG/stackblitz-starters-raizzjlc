if (!res.ok) return NextResponse.json({ 
  error: 'Inventory is private or not found',
  status: res.status,
  statusText: res.statusText
}, { status: 404 })
```

Commit แล้วลองเปิด URL นี้อีกครั้งครับ:
```
https://pubg-inventory.vercel.app/api/inventory?steamid=76561198145644994
