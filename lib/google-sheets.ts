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
  currentPrice?: number
}

export type DomesticStock = {
  name: string
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
  currentPriceKRW?: number
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
  tierTargets: Record<string, number>
}> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const id = process.env.GOOGLE_SPREADSHEET_ID!

  const [domesticRes, usRes, priceRes, dsRes, totalRes, tierRes, commodityPriceRes, fxRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '자산현황!A4:F9' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '비중관리(미국)!B3:I20' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '매매가관리!A2:G30' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Database(국내)!A2:M' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '자산현황!E2' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '자산현황!H1:J1' }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: "'금&은'!D10:D35" }),
    sheets.spreadsheets.values.get({ spreadsheetId: id, range: '현금!M1' }),
  ])

  const parseNum = (v: unknown) => parseFloat(String(v ?? '').replace(/[₩$\s,]/g, '')) || 0
  const exchangeRate = parseNum((fxRes.data.values ?? [])[0]?.[0]) || 1350
  const cpRows = commodityPriceRes.data.values ?? []
  // 금&은!D10:D35 → index: D10=0, D15=5, D25=15, D35=25
  const commodityPriceMap: Record<string, number> = {
    '금':       parseNum(cpRows[0]?.[0]),                                 // D10: KRW
    '은':       Math.round(parseNum(cpRows[5]?.[0])  * exchangeRate),     // D15: SLV USD
    '구리':     Math.round(parseNum(cpRows[15]?.[0]) * exchangeRate),     // D25: FCX USD
    '천연가스': Math.round(parseNum(cpRows[25]?.[0]) * exchangeRate),     // D35: LNG USD
  }

  const domestic: DomesticAsset[] = (domesticRes.data.values ?? [])
    .map(r => {
      const name = (r[0] ?? '') as string
      const price = commodityPriceMap[name] ?? 0
      return {
        name,
        currentAmount: parseKRW(r[1] ?? ''),
        targetAmount: parseKRW(r[4] ?? ''),
        transferAmount: parseKRW(r[5] ?? ''),
        ...(price > 0 ? { currentPrice: price } : {}),
      }
    })
    .filter(a => a.name)

  // 비중관리(미국) B3:I20 → r[0]=B(name), r[1]=C(ticker), r[2]=D(보유), r[5]=G(목표), r[6]=H(이동), r[7]=I(현재가 KRW)
  const us: UsAsset[] = (usRes.data.values ?? [])
    .map(r => {
      const name = (r[0] ?? '') as string
      const priceKRW = parseNum(r[7])
      return {
        name,
        ticker: r[1] ?? '',
        currentAmount: parseKRW(r[2] ?? ''),
        targetAmount: parseKRW(r[5] ?? ''),
        transferAmount: parseKRW(r[6] ?? ''),
        ...(priceKRW > 0 ? { currentPriceKRW: priceKRW } : {}),
      }
    })
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
      name: (r[1] ?? '').toString().trim(),
      tier: (r[5] ?? '').toString().trim().replace('티어', ''),
      evalAmount: parseKRW(r[11] ?? ''),
      heldRatio: parseFloat((r[12] ?? '').toString().replace(/%/g, '').replace(/,/g, '')) || 0,
    }))
    .filter(s => ['1', '2', '3'].includes(s.tier))

  const totalEvalAmount = parseKRW((totalRes.data.values ?? [])[0]?.[0] ?? '')

  const tierRow = (tierRes.data.values ?? [])[0] ?? []
  const tierTargets: Record<string, number> = {
    '1': parseFloat(tierRow[0]) || 40,
    '2': parseFloat(tierRow[1]) || 35,
    '3': parseFloat(tierRow[2]) || 30,
  }

  return { domestic, us, prices, domesticStocks, totalEvalAmount, tierTargets }
}

const FIELD_TO_COL: Record<string, number> = {
  secondBuyPrice: 1,
  secondBuyMemo: 2,
  thirdBuyPrice: 3,
  thirdBuyMemo: 4,
  takeProfitPrice: 5,
  takeProfitMemo: 6,
}

const TIER_TO_COL: Record<string, string> = { '1': 'H', '2': 'I', '3': 'J' }

export async function updateTierTarget(tier: string, value: number) {
  const col = TIER_TO_COL[tier]
  if (!col) throw new Error(`Unknown tier: ${tier}`)

  const auth = getAuth(true)
  const sheets = google.sheets({ version: 'v4', auth })
  const id = process.env.GOOGLE_SPREADSHEET_ID!

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `자산현황!${col}1`,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] },
  })
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
