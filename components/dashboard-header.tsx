"use client"

import { TrendingUp, Wallet } from "lucide-react"

interface DashboardHeaderProps {
  totalInvested: number
  totalTarget: number
}

export function DashboardHeader({ totalInvested, totalTarget }: DashboardHeaderProps) {
  const percentage = (totalInvested / totalTarget) * 100
  const remaining = totalTarget - totalInvested

  const formatKRW = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">투자 대시보드</h1>
          <p className="text-xs text-muted-foreground">포트폴리오 현황</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">총 투자</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatKRW(totalInvested)}</p>
          <p className="text-xs text-primary">{percentage.toFixed(1)}% 달성</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <Wallet className="w-3 h-3 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">추가 투자 가능</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatKRW(remaining)}</p>
          <p className="text-xs text-muted-foreground">목표 {formatKRW(totalTarget)}</p>
        </div>
      </div>
    </header>
  )
}
