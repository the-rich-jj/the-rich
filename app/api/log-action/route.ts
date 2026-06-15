import { NextRequest, NextResponse } from 'next/server'
import { logAlertAction } from '@/lib/google-sheets'

export async function POST(req: NextRequest) {
  try {
    const { name, field, previousValue, memo } = await req.json()
    if (!name || !field) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await logAlertAction(name, field, previousValue ?? '', memo ?? '')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
