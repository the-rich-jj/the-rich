import { google } from 'googleapis'

function getAuth(write = false) {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8')
  )
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [write
      ? 'https://www.googleapis.com/auth/spreadsheets'
      : 'https://www.googleapis.com/auth/spreadsheets.readonly'],
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

export type DomesticStock = {
  tier: string
  evalAmount: number
  heldRatio: number
}

export type UsAsset = {
  name: string
  ticker: string
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
  us: UsAsset[]
  prices: Record<string, PriceData>
  domesticStocks: DomesticStock[]
  totalEvalAmount: number
}> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const id = process.env.GOOGLE_SPREADSHEET_ID!

  const [domesticRes, usRes, priceRes, dsRes, totalRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '자산현황!A4:F9' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '비중관리(미국)!B3:H20' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '매매가관리!A2:G30' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '주식(국내)!A2:I100' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '자산현황!E2' }),
  ])

  const domestic: DomesticAsset[] = (domesticRes.data.values ?? [])
    .map(r => ({
      name: r[0] ?? '',
      currentAmount: parseKRW(r[1] ?? ''),
      targetAmount: parseKRW(r[4] ?? ''),
      transferAmount: parseKRW(r[5] ?? ''),
    }))
    .filter(a => a.name)

  const us: UsAsset[] = (usRes.data.values ?? [])
    .map(r => ({
      name: r[0] ?? '',
      ticker: r[1] ?? '',
      currentAmount: parseKRW(r[2] ?? ''),
      targetAmount: parseKRW(r[5] ?? ''),
      transferAmount: parseKRW(r[6] ?? ''),
    }))
    .filter(a => a.name)

  const prices: Record<string, PriceData> = {}
  for (const r of (priceRes.data.values ?? [])) {
    const name = r[0]
    if (!name) continue
    prices[name] = {
      secondBuyPrice: r[1] ?? '',
      secondBuyMemo: r[2] ?? '',
      thirdBuyPrice: r[3] ?? '',
      thirdBuyMemo: r[4] ?? '',
      takeProfitPrice: r[5] ?? '',
      takeProfitMemo: r[6] ?? '',
    }
  }

  const domesticStocks: DomesticStock[] = (dsRes.data.values ?? [])
    .map(r => ({
      tier: (r[2] ?? '').toString().trim(),
      evalAmount: parseKRW(r[7] ?? ''),
      heldRatio: parseFloat((r[8] ?? '').toString().replace(/%/g, '').replace(/,/g, '')) || 0,
    }))
    .filter(s => ['1', '2', '3'].includes(s.tier))

  const totalEvalAmount = parseKRW((totalRes.data.values ?? [])[0]?.[0] ?? '')

  return { domestic, us, prices, domesticStocks, totalEvalAmount }
}

const FIELD_TO_COL: Record<string, number> = {
  secondBuyPrice: 1,
  secondBuyMemo: 2,
  thirdBuyPrice: 3,
  thirdBuyMemo: 4,
  takeProfitPrice: 5,
  takeProfitMemo: 6,
}

export async function updatePriceCell(name: string, field: string, value: string) {
  const colIdx = FIELD_TO_COL[field]
  if (colIdx === undefined) throw new Error(`Unknown field: ${field}`)

  const auth = getAuth(true)
  const sheets = google.sheets({ version: 'v4', auth })
  const id = process.env.GOOGLE_SPREADSHEET_ID!

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: '매매가관리!A2:A30' })
  const rows = res.data.values ?? []
  const rowIndex = rows.findIndex(r => r[0] === name)

  const colLetter = String.fromCharCode(65 + colIdx)

  if (rowIndex === -1) {
    const newRow = new Array(7).fill('')
    newRow[0] = name
    newRow[colIdx] = value
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: '매매가관리!A:G',
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })
  } else {
    const row = rowIndex + 2
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: `매매가관리!${colLetter}${row}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[value]] },
    })
  }
}
