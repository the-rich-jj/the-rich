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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 pb-3 pt-5">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
              onCategoryChange(category)
            }}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="종목 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-muted/50 border border-border/50 rounded-full pl-9 pr-4 py-2 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-border/80 transition-colors"
        />
      </div>
    </header>
  )
}
