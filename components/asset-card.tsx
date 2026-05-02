"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Check, X } from "lucide-react"

interface AssetCardProps {
  name: string
  symbol: string
  icon: React.ReactNode
  targetAmount: number
  currentAmount: number
  transferAmount: number
  secondBuyPrice?: string
  thirdBuyPrice?: string
  takeProfitPrice?: string
  secondBuyMemo?: string
  thirdBuyMemo?: string
  takeProfitMemo?: string
  color: string
}

type MemoKey = "second" | "third" | "profit"
type FieldKey = 'secondBuyPrice' | 'secondBuyMemo' | 'thirdBuyPrice' | 'thirdBuyMemo' | 'takeProfitPrice' | 'takeProfitMemo'

function fmtPrice(s: string): string {
  const n = parseFloat((s ?? '').replace(/,/g, ''))
  if (!n) return ''
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
  if (n >= 10000) return `${Math.round(n / 10000)}만`
  return n.toLocaleString()
}

export function AssetCard({
  name,
  symbol,
  icon,
  targetAmount,
  currentAmount,
  transferAmount,
  secondBuyPrice = '',
  thirdBuyPrice = '',
  takeProfitPrice = '',
  secondBuyMemo = '',
  thirdBuyMemo = '',
  takeProfitMemo = '',
  color,
}: AssetCardProps) {
  const [openMemo, setOpenMemo] = useState<MemoKey | null>(null)
  const [local, setLocal] = useState<Record<FieldKey, string>>({
    secondBuyPrice, secondBuyMemo, thirdBuyPrice, thirdBuyMemo, takeProfitPrice, takeProfitMemo,
  })
  const [editingField, setEditingField] = useState<FieldKey | null>(null)
  const [editValue, setEditValue] = useState('')

  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0

  const fmt = (amount: number) => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만`
    return `${amount.toLocaleString()}`
  }

  const tipLeft = Math.max(6, Math.min(percentage, 92))

  useEffect(() => {
    if (openMemo === null) return
    const close = () => setOpenMemo(null)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [openMemo])

  const startEdit = (field: FieldKey, current: string) => {
    setEditingField(field)
    setEditValue(current)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const saveEdit = async () => {
    if (!editingField) return
    const newValue = editValue.trim()
    setLocal(prev => ({ ...prev, [editingField]: newValue }))
    setEditingField(null)
    setEditValue('')
    await fetch('/api/update-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, field: editingField, value: newValue }),
    }).catch(() => {})
  }

  const priceBoxes: Array<{
    key: MemoKey
    label: string
    priceField: FieldKey
    memoField: FieldKey
    bgColor: string
    textClass: string
  }> = [
    { key: "second", label: "2차 매수가", priceField: "secondBuyPrice", memoField: "secondBuyMemo", bgColor: "#252528", textClass: "text-foreground" },
    { key: "third",  label: "3차 매수가", priceField: "thirdBuyPrice",  memoField: "thirdBuyMemo",  bgColor: "#252528", textClass: "text-foreground" },
    { key: "profit", label: "익절가",     priceField: "takeProfitPrice", memoField: "takeProfitMemo", bgColor: "#1E2820", textClass: "text-primary" },
  ]

  return (
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
          <div>
            <h3 className="font-semibold text-sm text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
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
              {transferAmount < 0 ? `-${fmt(Math.abs(transferAmount))} 초과` : `+${fmt(transferAmount)} 추가`}
            </span>
            <span>목표 {fmt(targetAmount)}</span>
          </div>
        </div>

        {/* Price Targets */}
        <div className="grid grid-cols-3 gap-1.5">
          {priceBoxes.map(({ key, label, priceField, memoField, bgColor, textClass }) => {
            const price = local[priceField]
            const memo = local[memoField]
            const isEditingPrice = editingField === priceField
            const isEditingMemo = editingField === memoField

            return (
              <div key={key} className="relative">
                {/* Memo Tooltip */}
                {openMemo === key && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 w-max max-w-[180px]"
                    onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
                  >
                    <div className="bg-[#252528]/60 backdrop-blur-md border border-border/60 rounded-lg px-2.5 py-2 shadow-lg">
                      {isEditingMemo ? (
                        <div className="flex flex-col gap-1.5 min-w-[130px]">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                            className="text-xs bg-transparent border-b border-foreground/40 outline-none text-foreground w-full"
                            placeholder="메모 입력"
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={cancelEdit}>
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button onClick={saveEdit}>
                              <Check className="w-3 h-3 text-green-400" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5">
                          <p className="text-xs text-foreground leading-relaxed text-center flex-1">
                            {memo || <span className="text-muted-foreground/50 text-xs">메모 없음</span>}
                          </p>
                          <button
                            onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); startEdit(memoField, memo) }}
                            className="flex-shrink-0 mt-0.5 opacity-50 active:opacity-100"
                          >
                            <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mx-auto w-0 h-0" style={{
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid hsl(var(--border) / 0.6)",
                    }} />
                  </div>
                )}

                {/* Price Box */}
                <button
                  onClick={(e: { stopPropagation: () => void }) => {
                    e.stopPropagation()
                    if (!isEditingPrice) setOpenMemo(prev => prev === key ? null : key)
                  }}
                  className="w-full rounded-lg p-1.5 text-center active:opacity-70"
                  style={{ backgroundColor: bgColor }}
                >
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  {isEditingPrice ? (
                    <div
                      className="flex items-center justify-center gap-1"
                      onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                        onBlur={saveEdit}
                        className="w-14 text-xs text-center bg-transparent border-b border-foreground/40 outline-none text-foreground"
                        placeholder="숫자 입력"
                      />
                      <button onMouseDown={(e: { preventDefault: () => void }) => { e.preventDefault(); cancelEdit() }}>
                        <X className="w-2.5 h-2.5 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <p className={`text-xs font-medium ${textClass}`}>{fmtPrice(price) || "-"}</p>
                      <button
                        onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); startEdit(priceField, price) }}
                        className="opacity-40 active:opacity-100"
                      >
                        <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
