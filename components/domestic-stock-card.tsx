"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, X } from "lucide-react"

const TIER_CONFIG: Record<string, { label: string; cap: string; color: string }> = {
  '1': { label: '1티어', cap: '10조이상',  color: '#F5A623' },
  '2': { label: '2티어', cap: '1조이상',   color: '#8B8FA8' },
  '3': { label: '3티어', cap: '1조미만',   color: '#CD7F32' },
}

interface DomesticStockCardProps {
  tier: string
  stockCount: number
  heldRatio: number
  targetRatio: number
  totalEvalAmount: number
  stocks: string[]
  onTargetChange: (v: number) => void
}

export function DomesticStockCard({
  tier, stockCount, heldRatio, targetRatio, totalEvalAmount, stocks, onTargetChange,
}: DomesticStockCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [showList, setShowList] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showList) return
    const y = window.scrollY
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
  }, [showList])

  useEffect(() => {
    if (!showList) return
    const update = () => {
      if (!sheetRef.current) return
      const h = sheetRef.current.offsetHeight
      sheetRef.current.style.top = `${window.innerHeight - h}px`
      sheetRef.current.style.bottom = 'auto'
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [showList])

  const { label, cap, color } = TIER_CONFIG[tier] ?? { label: `${tier}티어`, cap: '', color: '#6B7280' }

  const pct = targetRatio > 0 ? Math.min((heldRatio / targetRatio) * 100, 100) : 0
  const tipLeft = Math.max(6, Math.min(pct, 92))
  const diff = heldRatio - targetRatio

  const perStockTarget = stockCount > 0 ? (totalEvalAmount * targetRatio / 100) / stockCount : 0

  const fmt = (n: number) => {
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
    if (n >= 10000) return `${Math.round(n / 10000)}만`
    return n.toLocaleString()
  }

  const commitEdit = () => {
    const n = parseFloat(draft)
    if (!isNaN(n) && n > 0 && n <= 100) onTargetChange(n)
    setEditing(false)
  }

  return (
    <Card className="border-border/50 py-3 bg-[#1A1A1E]">
      <CardContent className="px-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-0">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-sm text-foreground">{label}</h3>
          <span className="text-xs text-muted-foreground">· {cap}</span>
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
              {heldRatio.toFixed(1)}%
            </div>
            <div className="w-0 h-0" style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `4px solid ${color}`,
            }} />
          </div>

          <div className="relative h-2 rounded-full overflow-hidden bg-[#2A2A2E]">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>보유</span>
            <span style={{ color: diff < 0 ? color : '#EF4444' }}>
              {diff < 0
                ? `+${Math.abs(diff).toFixed(1)}% 추가`
                : `-${diff.toFixed(1)}% 초과`}
            </span>
            <span>목표 {targetRatio}%</span>
          </div>
        </div>

        {/* Bottom row: per-stock target + editable target ratio + 종목 리스트 */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="rounded-lg px-3 py-2 bg-[#252528]">
            <p className="text-xs text-muted-foreground mb-0.5">1종목당 목표</p>
            <p className="text-sm font-semibold text-foreground">{fmt(perStockTarget)}</p>
          </div>

          <div className="rounded-lg px-3 py-2 bg-[#252528]">
            <p className="text-xs text-muted-foreground mb-0.5">목표 비중</p>
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
                  autoFocus
                  style={{ fontSize: '16px' }}
                  className="w-14 rounded bg-[#1A1A1E] border border-border/40 px-1.5 py-0.5 text-foreground outline-none"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            ) : (
              <button
                onClick={() => { setDraft(String(targetRatio)); setEditing(true) }}
                className="flex items-center gap-1.5 active:opacity-60"
              >
                <span className="text-sm font-semibold" style={{ color }}>{targetRatio}%</span>
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowList(true)}
            className="rounded-lg px-3 py-2 bg-[#252528] text-left active:opacity-60"
          >
            <p className="text-xs text-muted-foreground mb-0.5">종목 리스트</p>
            <p className="text-sm font-semibold text-foreground">{stockCount}종목</p>
          </button>
        </div>
      </CardContent>

      {/* 종목 리스트 바텀시트 */}
      {showList && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowList(false)}
          />
          <div
            ref={sheetRef}
            className="fixed left-0 right-0 z-50 bg-[#1A1A1E] rounded-t-2xl"
            style={{ bottom: 0 }}
          >
            {/* handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#3A3A3E]" />
            </div>
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <span className="text-sm font-semibold text-foreground">
                {label} 종목 리스트
              </span>
              <button onClick={() => setShowList(false)} className="text-muted-foreground active:opacity-60">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* list */}
            <div
              className="overflow-y-auto px-4 py-2"
              style={{ maxHeight: '55vh', paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
            >
              {stocks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">종목 없음</p>
              ) : (
                stocks.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-3 border-b border-border/10 last:border-0"
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm text-foreground">{name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
