function parseSingleNum(s: string, rate: number): number | null {
  const t = s.trim()
  if (t.startsWith('$')) {
    const n = parseFloat(t.slice(1).replace(/,/g, ''))
    return isNaN(n) ? null : n * rate
  }
  const n = parseFloat(t.replace(/[₩,\s]/g, ''))
  return !isNaN(n) && n > 0 ? n : null
}

// "X이상 Y이하", "X이하", "X이상", 또는 순수 숫자 표현을 모두 해석
export function checkPriceAlert(
  priceStr: string,
  currentKRW: number,
  rate: number,
  defaultDir: 'lte' | 'gte',
): boolean {
  if (!priceStr?.trim() || !currentKRW) return false
  const s = priceStr.trim()
  const loM = s.match(/([0-9,.₩$]+)\s*이상/)
  const hiM = s.match(/([0-9,.₩$]+)\s*이하/)
  if (loM && hiM) {
    const lo = parseSingleNum(loM[1], rate)
    const hi = parseSingleNum(hiM[1], rate)
    if (lo !== null && hi !== null) return currentKRW >= lo && currentKRW <= hi
  }
  if (hiM) {
    const hi = parseSingleNum(hiM[1], rate)
    if (hi !== null) return currentKRW <= hi
  }
  if (loM) {
    const lo = parseSingleNum(loM[1], rate)
    if (lo !== null) return currentKRW >= lo
  }
  const p = parseSingleNum(s, rate)
  if (p !== null) return defaultDir === 'lte' ? currentKRW <= p : currentKRW >= p
  return false
}

export function hasAnyPriceAlert(
  secondBuyPrice: string,
  thirdBuyPrice: string,
  takeProfitPrice: string,
  currentKRW: number,
  rate: number,
): boolean {
  return (
    checkPriceAlert(secondBuyPrice,  currentKRW, rate, 'lte') ||
    checkPriceAlert(thirdBuyPrice,   currentKRW, rate, 'lte') ||
    checkPriceAlert(takeProfitPrice, currentKRW, rate, 'gte')
  )
}
