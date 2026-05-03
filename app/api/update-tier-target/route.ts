import { updateTierTarget } from '@/lib/google-sheets'

export async function POST(req: Request) {
  const { tier, value } = await req.json()
  await updateTierTarget(tier, value)
  return Response.json({ ok: true })
}
