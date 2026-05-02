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

export type DomesticAsset = {
  name: string
  currentAmount: number
  targetAmount: number
  transferAmount: number
}

export async function fetchAssetData(): Promise<{ domestic: DomesticAsset[]; us: string[] }> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const id = process.env.GOOGLE_SPREADSHEET_ID!

  const [domesticRes, usRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '자산현황!A4:F9' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '비중관리(미국)!B3:B19' }),
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

  return { domestic, us }
}
