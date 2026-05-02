import { google } from 'googleapis'

function getAuth() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8')
  )
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

function parseKRW(s: string): number {
  const clean = (s ?? '').trim().replace(/[₩\s,]/g, '')
  if (clean.startsWith('(') && clean.endsWith(')')) return -(parseFloat(clean.slice(1, -1)) || 0)
  return parseFloat(clean) || 0
}

function fmtPrice(s: string): string {
  const n = parseFloat((s ?? '').replace(/,/g, ''))
  if (!n) return ''
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
  if (n >= 10000) return `${Math.round(n / 10000)}만`
  return n.toLocaleString()
}

export type DomesticAsset = {
  name: string
  currentAmount: number
  targetAmount: number
  transferAmount: number
}

export type PriceData = {
  secondBuyPrice: string
  secondBuyMemo: string
  thirdBuyPrice: string
  thirdBuyMemo: string
  takeProfitPrice: string
  takeProfitMemo: string
}

export async function fetchAssetData(): Promise<{
  domestic: DomesticAsset[]
  us: string[]
  prices: Record<string, PriceData>
}> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const id = process.env.GOOGLE_SPREADSHEET_ID!

  const [domesticRes, usRes, priceRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '자산현황!A4:F9' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '비중관리(미국)!B3:B19' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '매매가관리!A2:G30' }),
  ])

  const domestic: DomesticAsset[] = (domesticRes.data.values ?? [])
    .map(r => ({
      name: r[0] ?? '',
      currentAmount: parseKRW(r[1] ?? ''),
      targetAmount: parseKRW(r[4] ?? ''),
      transferAmount: parseKRW(r[5] ?? ''),
    }))
    .filter(a => a.name)

  const us = (usRes.data.values ?? []).map(r => r[0]).filter(Boolean) as string[]

  const prices: Record<string, PriceData> = {}
  for (const r of (priceRes.data.values ?? [])) {
    const name = r[0]
    if (!name) continue
    prices[name] = {
      secondBuyPrice: fmtPrice(r[1] ?? ''),
      secondBuyMemo: r[2] ?? '',
      thirdBuyPrice: fmtPrice(r[3] ?? ''),
      thirdBuyMemo: r[4] ?? '',
      takeProfitPrice: fmtPrice(r[5] ?? ''),
      takeProfitMemo: r[6] ?? '',
    }
  }

  return { domestic, us, prices }
}
