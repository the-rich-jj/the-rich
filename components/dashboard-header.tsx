"use client"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function DashboardHeader({ categories, activeCategory, onCategoryChange, searchQuery, onSearchChange }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">투자 대시보드</h1>
          <p className="text-xs text-muted-foreground">포트폴리오 현황</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="종목 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-muted/50 border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-border/80 transition-colors"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150",
              activeCategory === category
                ? "bg-white text-black"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </header>
  )
}
