"use client"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function DashboardHeader({ categories, activeCategory, onCategoryChange }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">투자 대시보드</h1>
          <p className="text-xs text-muted-foreground">포트폴리오 현황</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
              activeCategory === category
                ? "text-black"
                : "bg-muted text-muted-foreground hover:bg-muted/80 transition-colors duration-200"
            )}
          >
            {activeCategory === category && (
              <span
                key={`fill-${category}`}
                className="absolute inset-0 rounded-full bg-white origin-left animate-[tab-fill_0.25s_ease-out_forwards]"
              />
            )}
            <span className="relative z-10">{category}</span>
          </button>
        ))}
      </div>
    </header>
  )
}
