"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil } from "lucide-react"

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  '1': { label: '1티어', color: '#F5A623' },
  '2': { label: '2티어', color: '#8B8FA8' },
  '3': { label: '3티어', color: '#CD7F32' },
}

interface DomesticStockCardProps {
  tier: string
  stockCount: number
  heldRatio: number
  targetRatio: number
  totalEvalAmount: number
  onTargetChange: (v: number) => void
}

export function DomesticStockCard({
  tier, stockCount, heldRatio, targetRatio, totalEvalAmount, onTargetChange,
}: DomesticStockCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const { label, color } = TIER_CONFIG[tier] ?? { label: `${tier}티어`, color: '#6B7280' }

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
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <h3 className="font-semibold text-sm text-foreground">{label}</h3>
            <span className="text-xs text-muted-foreground">{stockCount}종목</span>
          </div>

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
                className="w-14 text-right rounded bg-[#252528] border border-border/40 px-1.5 py-0.5 text-foreground outline-none"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          ) : (
            <button
              onClick={() => { setDraft(String(targetRatio)); setEditing(true) }}
              className="flex items-center gap-1.5 rounded-md px-2 py-0.5 active:opacity-60"
              style={{ backgroundColor: `${color}20` }}
            >
              <span className="text-xs font-semibold" style={{ color }}>목표 {targetRatio}%</span>
              <Pencil className="w-2.5 h-2.5" style={{ color }} />
            </button>
          )}
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

        {/* Per-stock target */}
        <div className="rounded-lg px-3 py-2 text-center bg-[#252528]">
          <p className="text-xs text-muted-foreground mb-0.5">1종목당 목표</p>
          <p className="text-sm font-semibold text-foreground">{fmt(perStockTarget)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
