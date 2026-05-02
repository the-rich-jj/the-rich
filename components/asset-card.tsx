"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface AssetCardProps {
  name: string
  symbol: string
  icon: React.ReactNode
  targetAmount: number
  currentAmount: number
  secondBuyPrice?: string
  thirdBuyPrice?: string
  takeProfitPrice?: string
  memo?: string
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
  memo,
  color,
}: AssetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const remainingAmount = targetAmount - currentAmount
  const percentage = (currentAmount / targetAmount) * 100

  const formatKRW = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: `${color}20` }}
            >
              <span style={{ color }}>{icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-xs text-muted-foreground">{symbol}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-medium"
            style={{ 
              backgroundColor: `${color}20`,
              color: color 
            }}
          >
            {percentage.toFixed(1)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>보유</span>
            <span>목표</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: color 
              }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground mb-1">보유</p>
            <p className="text-sm font-semibold text-foreground">
              {formatKRW(currentAmount)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground mb-1">목표</p>
            <p className="text-sm font-semibold text-foreground">
              {formatKRW(targetAmount)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground mb-1">추가 매수</p>
            <p className="text-sm font-semibold" style={{ color }}>
              {formatKRW(remainingAmount)}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              <span>접기</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>매수가 & 메모</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="pt-3 border-t border-border/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Price Targets */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">2차 매수가</p>
                <p className="text-xs font-medium text-foreground">
                  {secondBuyPrice || "-"}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">3차 매수가</p>
                <p className="text-xs font-medium text-foreground">
                  {thirdBuyPrice || "-"}
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">익절가</p>
                <p className="text-xs font-medium text-primary">
                  {takeProfitPrice || "-"}
                </p>
              </div>
            </div>

            {/* Memo */}
            {memo && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">메모</p>
                <p className="text-sm text-foreground leading-relaxed">{memo}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
