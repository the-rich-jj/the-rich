"use client"

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
  color: string
}

export function AssetCard({
  name,
  symbol,
  icon,
  targetAmount,
  currentAmount,
  secondBuyPrice,
  thirdBuyPrice,
  takeProfitPrice,
  color,
}: AssetCardProps) {
  const remainingAmount = targetAmount - currentAmount
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100)

  const fmt = (amount: number) => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만`
    return `${amount.toLocaleString()}`
  }

  const tipLeft = Math.max(6, Math.min(percentage, 88))

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="px-3 py-2">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
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

          <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
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
          <div className="bg-secondary/50 rounded-lg p-1.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">2차 매수가</p>
            <p className="text-xs font-medium text-foreground">{secondBuyPrice || "-"}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-1.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">3차 매수가</p>
            <p className="text-xs font-medium text-foreground">{thirdBuyPrice || "-"}</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-1.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">익절가</p>
            <p className="text-xs font-medium text-primary">{takeProfitPrice || "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
