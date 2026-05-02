import { NextRequest, NextResponse } from 'next/server'
import { updatePriceCell } from '@/lib/google-sheets'

export async function POST(req: NextRequest) {
  try {
    const { name, field, value } = await req.json()
    if (!name || !field) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await updatePriceCell(name, field, value ?? '')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
