"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AssetCardProps {
  name: string
  symbol: string
  icon: React.ReactNode
  targetAmount: number
  currentAmount: number
  transferAmount: number
  currentPriceKRW?: number
  secondBuyPrice?: string
  thirdBuyPrice?: string
  takeProfitPrice?: string
  secondBuyMemo?: string
  thirdBuyMemo?: string
  takeProfitMemo?: string
  color: string
  isUsdBased?: boolean
  exchangeRate?: number
}

type BoxKey = "second" | "third" | "profit"

function fmtPrice(s: string): string {
  if (!s?.trim()) return ''
  // 한글, 특수문자, $ 또는 ₩ 포함 → 그대로 표시
  if (/[^\d.,₩$\s-]/.test(s) || s.includes('$') || s.includes('₩')) return s.trim()
  const n = parseFloat(s.replace(/,/g, ''))
  if (isNaN(n)) return s.trim()
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
  if (n >= 10000) return `${Math.round(n / 10000)}만`
  return n.toLocaleString()
}

export function AssetCard({
  name, symbol, icon,
  targetAmount, currentAmount, transferAmount, currentPriceKRW,
  secondBuyPrice = '', thirdBuyPrice = '', takeProfitPrice = '',
  secondBuyMemo = '', thirdBuyMemo = '', takeProfitMemo = '',
  color,
  isUsdBased = false,
  exchangeRate = 1350,
}: AssetCardProps) {
  const [local, setLocal] = useState({
    secondBuyPrice, secondBuyMemo, thirdBuyPrice, thirdBuyMemo, takeProfitPrice, takeProfitMemo,
  })
  const [showUsd, setShowUsd] = useState(isUsdBased)
  const [openModal, setOpenModal] = useState<BoxKey | null>(null)
  const [draftPrice, setDraftPrice] = useState('')
  const [draftMemo, setDraftMemo] = useState('')
  const [saving, setSaving] = useState(false)

  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0

  const fmt = (amount: number) => {
    if (showUsd) {
      const usd = amount / exchangeRate
      if (usd >= 10000) return `$${Math.round(usd).toLocaleString('en-US')}`
      if (usd >= 1) return `$${usd.toFixed(0)}`
      return `$${usd.toFixed(2)}`
    }
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만`
    return `₩${amount.toLocaleString()}`
  }

  const fmtCurrentPrice = currentPriceKRW
    ? showUsd
      ? `$${(currentPriceKRW / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      : `₩${currentPriceKRW.toLocaleString()}`
    : null

  const tipLeft = Math.max(6, Math.min(percentage, 92))

  const priceBoxes: Array<{
    key: BoxKey
    label: string
    priceKey: keyof typeof local
    memoKey: keyof typeof local
    bgColor: string
    textClass: string
  }> = [
    { key: "second", label: "2차 매수가", priceKey: "secondBuyPrice", memoKey: "secondBuyMemo", bgColor: "#252528", textClass: "text-foreground" },
    { key: "third",  label: "3차 매수가", priceKey: "thirdBuyPrice",  memoKey: "thirdBuyMemo",  bgColor: "#252528", textClass: "text-foreground" },
    { key: "profit", label: "익절가",     priceKey: "takeProfitPrice", memoKey: "takeProfitMemo", bgColor: "#1E2820", textClass: "text-primary" },
  ]

  const visibleBoxes = priceBoxes.filter(box => !!local[box.priceKey]?.trim())
  const activeBox = priceBoxes.find(b => b.key === openModal)
  const savedScrollY = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  // 배경 스크롤 잠금
  useEffect(() => {
    if (openModal === null) return
    const y = window.scrollY
    savedScrollY.current = y
    document.body.style.position = 'fixed'
    document.body.style.top = `-${y}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, y)
    }
  }, [openModal])

  // 키보드 열리면 innerHeight 감소 → 시트 바로 위에 재배치
  useEffect(() => {
    if (openModal === null) return
    const update = () => {
      if (!sheetRef.current) return
      const h = sheetRef.current.offsetHeight
      sheetRef.current.style.top = `${window.innerHeight - h}px`
      sheetRef.current.style.bottom = 'auto'
    }
    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      if (sheetRef.current) {
        sheetRef.current.style.top = ''
        sheetRef.current.style.bottom = ''
      }
    }
  }, [openModal])

  const openEditModal = (box: typeof priceBoxes[0]) => {
    setDraftPrice(local[box.priceKey])
    setDraftMemo(local[box.memoKey])
    setOpenModal(box.key)
  }

  const closeModal = () => setOpenModal(null)

  const handleSave = async () => {
    if (!openModal || !activeBox) return
    setSaving(true)
    setLocal(prev => ({
      ...prev,
      [activeBox.priceKey]: draftPrice.trim(),
      [activeBox.memoKey]: draftMemo.trim(),
    }))
    setOpenModal(null)
    await Promise.all([
      fetch('/api/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, field: activeBox.priceKey, value: draftPrice.trim() }),
      }).catch(() => {}),
      fetch('/api/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, field: activeBox.memoKey, value: draftMemo.trim() }),
      }).catch(() => {}),
    ])
    setSaving(false)
  }

  return (
    <>
      <Card className="border-border/50 py-3 bg-[#1A1A1E]">
        <CardContent className="px-3">
          {/* Header */}
          <div className="flex items-center gap-2 mb-0">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <span style={{ color }}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">{name}</h3>
              <p className="text-xs text-muted-foreground">
                {symbol}
                {fmtCurrentPrice ? ` · ${fmtCurrentPrice}` : ''}
              </p>
            </div>
            <button
              onClick={() => setShowUsd(v => !v)}
              className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded bg-[#252528] text-muted-foreground active:opacity-60"
            >
              {showUsd ? '₩' : '$'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="pt-7 mb-3 relative">
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${tipLeft}%` }}
            >
              <div
                className="rounded px-1.5 py-0.5 text-xs font-semibold text-white leading-tight whitespace-nowrap"
                style={{ backgroundColor: color }}
              >
                {fmt(currentAmount)}
              </div>
              <div className="w-0 h-0" style={{
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: `4px solid ${color}`,
              }} />
            </div>

            <div className="relative h-2 rounded-full overflow-hidden bg-[#2A2A2E]">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: color }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>보유</span>
              <span style={{ color: transferAmount < 0 ? '#EF4444' : color }}>
                {transferAmount < 0
                  ? `-${fmt(Math.abs(transferAmount))} 초과`
                  : `+${fmt(transferAmount)} 추가${currentPriceKRW && transferAmount > 0
                      ? ` (≈${Math.floor(transferAmount / currentPriceKRW) < 1
                          ? (transferAmount / currentPriceKRW).toFixed(1)
                          : Math.floor(transferAmount / currentPriceKRW)}주)`
                      : ''}`}
              </span>
              <span>목표 {fmt(targetAmount)}</span>
            </div>
          </div>

          {/* Price Targets — 값 있는 박스만 표시 */}
          {visibleBoxes.length > 0 && (
            <div className={`grid gap-1.5 ${
              visibleBoxes.length === 3 ? 'grid-cols-3' :
              visibleBoxes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
            }`}>
              {visibleBoxes.map(box => (
                <button
                  key={box.key}
                  onClick={() => openEditModal(box)}
                  className="rounded-lg p-1.5 text-left active:opacity-70"
                  style={{ backgroundColor: box.bgColor }}
                >
                  <p className="text-xs text-muted-foreground mb-0.5">{box.label}</p>
                  <p className={`text-xs font-medium ${box.textClass}`}>
                    {fmtPrice(local[box.priceKey])}
                  </p>
                  {local[box.memoKey]?.trim() && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 leading-tight line-clamp-2">
                      {local[box.memoKey]}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Sheet */}
      {openModal !== null && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={closeModal}
          />
          <div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[#1A1A1E] border-t border-border/50"
          >
            <div className="px-4 pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-border/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">
                {name} · {activeBox?.label}
              </p>
            </div>
            <div className="px-4 pb-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">가격</label>
                <input
                  value={draftPrice}
                  onChange={e => setDraftPrice(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-lg bg-[#252528] border border-border/40 px-3 py-2 text-foreground outline-none focus:border-border"
                  placeholder="예: 210000, $148.5, 적당할때"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">메모</label>
                <textarea
                  value={draftMemo}
                  onChange={e => setDraftMemo(e.target.value)}
                  rows={2}
                  style={{ fontSize: '16px' }}
                  className="w-full rounded-lg bg-[#252528] border border-border/40 px-3 py-2 text-foreground outline-none focus:border-border resize-none"
                  placeholder="매수/익절 근거를 적어보세요"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
                style={{ backgroundColor: color }}
              >
                저장
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
