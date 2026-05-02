"use client"
import { Wallet } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-4">
      <div className="flex items-center justify-between">
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
    </header>
  )
}
