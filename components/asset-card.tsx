"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface AssetCardProps {
  name: string
  symbol: string
  icon: React.ReactNode
  targetAmount: number
  currentAmount: number
  secondBuyPrice?: string
  thirdBuyPrice?: string
  takeProfitPrice?: string
  secondBuyMemo?: string
  thirdBuyMemo?: string
  takeProfitMemo?: string
  color: string
}

type MemoKey = "second" | "third" | "profit"

export function AssetCard({
  name,
  symbol,
  icon,
  targetAmount,
  currentAmount,
  secondBuyPrice,
  thirdBuyPrice,
  takeProfitPrice,
  secondBuyMemo,
  thirdBuyMemo,
  takeProfitMemo,
  color,
}: AssetCardProps) {
  const [openMemo, setOpenMemo] = useState<MemoKey | null>(null)
  const remainingAmount = targetAmount - currentAmount
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100)

  const fmt = (amount: number) => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만`
    return `${amount.toLocaleString()}`
  }

  const tipLeft = Math.max(6, Math.min(percentage, 88))

  const toggleMemo = (key: MemoKey, hasMemo: boolean) => {
    if (!hasMemo) return
    setOpenMemo((prev: MemoKey | null) => prev === key ? null : key)
  }

  const priceBoxes: Array<{
    key: MemoKey
    label: string
    price?: string
    memo?: string
    bgColor: string
    textClass: string
  }> = [
    { key: "second", label: "2차 매수가", price: secondBuyPrice, memo: secondBuyMemo, bgColor: "#252528", textClass: "text-foreground" },
    { key: "third",  label: "3차 매수가", price: thirdBuyPrice,  memo: thirdBuyMemo,  bgColor: "#252528", textClass: "text-foreground" },
    { key: "profit", label: "익절가",     price: takeProfitPrice, memo: takeProfitMemo, bgColor: "#1E2820", textClass: "text-primary" },
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
          {/* 보유 말풍선 */}
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
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: `4px solid ${color}`,
              }}
            />
          </div>
          {/* 목표 레이블 */}
          <div className="absolute top-0.5 right-0 text-xs text-muted-foreground whitespace-nowrap">
            {fmt(targetAmount)}
          </div>

          <div className="relative h-2 rounded-full overflow-hidden bg-[#2A2A2E]">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: color }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>보유</span>
            <span style={{ color }}>+{fmt(remainingAmount)} 추가</span>
            <span>목표</span>
          </div>
        </div>

        {/* Price Targets */}
        <div className="grid grid-cols-3 gap-1.5">
          {priceBoxes.map(({ key, label, price, memo, bgColor, textClass }) => (
            <div key={key} className="relative">
              {openMemo === key && memo && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 w-40 pointer-events-none">
                  <div className="bg-[#252528]/60 backdrop-blur-md border border-border/60 rounded-lg px-2.5 py-2 text-xs text-foreground shadow-lg leading-relaxed">
                    {memo}
                  </div>
                  <div
                    className="mx-auto w-0 h-0"
                    style={{
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid hsl(var(--border) / 0.6)",
                    }}
                  />
                </div>
              )}
              <button
                onClick={() => toggleMemo(key, !!memo)}
                className={`w-full rounded-lg p-1.5 text-center transition-opacity ${memo ? "cursor-pointer active:opacity-70" : "cursor-default"}`}
                style={{ backgroundColor: bgColor }}
              >
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className={`text-xs font-medium ${textClass}`}>{price || "-"}</p>
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
