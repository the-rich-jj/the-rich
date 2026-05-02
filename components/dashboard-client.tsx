"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AssetCard } from "@/components/asset-card"
import {
  Gem, CircleDollarSign, Cpu, Flame, Bitcoin, Coins, Zap, Droplets,
  TrendingUp, ShoppingCart, Globe, Monitor, Shield, Pill, Rocket,
  Bot, Brain, BarChart2, DollarSign,
} from "lucide-react"

type AssetData = {
  id: number
  name: string
  symbol: string
  icon: React.ReactNode
  category: string
  targetAmount: number
  currentAmount: number
  secondBuyPrice: string
  thirdBuyPrice: string
  takeProfitPrice: string
  secondBuyMemo: string
  thirdBuyMemo: string
  takeProfitMemo: string
  color: string
}

const ASSET_CONFIG: Record<string, { symbol: string; icon: React.ReactNode; color: string; category: string }> = {
  '금':                                    { symbol: 'GOLD',    icon: <Gem className="w-5 h-5" />,           color: '#F5A623', category: '원자재' },
  '은':                                    { symbol: 'SILVER',  icon: <Coins className="w-5 h-5" />,         color: '#C0C0C0', category: '원자재' },
  '구리':                                  { symbol: 'COPPER',  icon: <CircleDollarSign className="w-5 h-5" />, color: '#B87333', category: '원자재' },
  '천연가스':                              { symbol: 'NAT GAS', icon: <Flame className="w-5 h-5" />,         color: '#FF6B35', category: '에너지' },
  '비트코인':                              { symbol: 'BTC',     icon: <Bitcoin className="w-5 h-5" />,       color: '#F7931A', category: '암호화폐' },
  '알트코인':                              { symbol: 'ALT',     icon: <Zap className="w-5 h-5" />,           color: '#627EEA', category: '암호화폐' },
  '아마존닷컴':                            { symbol: 'AMZN',   icon: <ShoppingCart className="w-5 h-5" />,  color: '#FF9900', category: '미국주식' },
  'GLOBAL X CYBERSECURITY':               { symbol: 'BUG',    icon: <Shield className="w-5 h-5" />,        color: '#00D4FF', category: '미국주식' },
  '알파벳 A':                              { symbol: 'GOOGL',  icon: <Globe className="w-5 h-5" />,         color: '#4285F4', category: '미국주식' },
  'ISHARES NASDAQ BIOTECHNOLOGY':         { symbol: 'IBB',    icon: <Pill className="w-5 h-5" />,          color: '#00B4A6', category: '미국주식' },
  '일라이 릴리':                           { symbol: 'LLY',    icon: <Pill className="w-5 h-5" />,          color: '#D52B1E', category: '미국주식' },
  '록히드 마틴':                           { symbol: 'LMT',    icon: <Shield className="w-5 h-5" />,        color: '#004990', category: '미국주식' },
  '마이크로소프트':                        { symbol: 'MSFT',   icon: <Monitor className="w-5 h-5" />,       color: '#00A4EF', category: '미국주식' },
  '팔란티어 테크':                         { symbol: 'PLTR',   icon: <Shield className="w-5 h-5" />,        color: '#8B5CF6', category: '미국주식' },
  'INVESCO NASDAQ 100':                   { symbol: 'QQQ',    icon: <BarChart2 className="w-5 h-5" />,     color: '#0070C0', category: '미국주식' },
  '로켓랩':                               { symbol: 'RKLB',   icon: <Rocket className="w-5 h-5" />,        color: '#E5041C', category: '미국주식' },
  'VANECK SEMICONDUCTOR':                 { symbol: 'SMH',    icon: <Cpu className="w-5 h-5" />,           color: '#FF6B35', category: '미국주식' },
  '심보틱':                               { symbol: 'SYM',    icon: <Bot className="w-5 h-5" />,           color: '#00C2A8', category: '미국주식' },
  '템퍼스 AI':                            { symbol: 'TEM',    icon: <Brain className="w-5 h-5" />,         color: '#9B59B6', category: '미국주식' },
  '테슬라':                               { symbol: 'TSLA',   icon: <TrendingUp className="w-5 h-5" />,    color: '#E31937', category: '미국주식' },
  'VANGUARD RUSSELL 2000':               { symbol: 'VTWO',   icon: <BarChart2 className="w-5 h-5" />,     color: '#B20000', category: '미국주식' },
  'SPDR FINANCIAL SELECT SECTOR':        { symbol: 'XLF',    icon: <DollarSign className="w-5 h-5" />,    color: '#1E6B52', category: '미국주식' },
  'Defiance AI and Power Infrastructure': { symbol: 'AIPX',   icon: <Zap className="w-5 h-5" />,           color: '#6366F1', category: '미국주식' },
}

function buildAssets(names: string[], startId: number): AssetData[] {
  return names.map((name, idx) => {
    const config = ASSET_CONFIG[name] ?? {
      symbol: name.split(' ')[0].toUpperCase().slice(0, 6),
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#6B7280',
      category: '미국주식',
    }
    return {
      id: startId + idx,
      name,
      ...config,
      targetAmount: 0,
      currentAmount: 0,
      secondBuyPrice: '',
      thirdBuyPrice: '',
      takeProfitPrice: '',
      secondBuyMemo: '',
      thirdBuyMemo: '',
      takeProfitMemo: '',
    }
  })
}

const categories = ['전체', '원자재', '에너지', '암호화폐', '미국주식']

interface Props {
  domesticAssets: string[]
  usAssets: string[]
}

export function DashboardClient({ domesticAssets, usAssets }: Props) {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')

  const allAssets: AssetData[] = [
    ...buildAssets(domesticAssets, 1),
    ...buildAssets(usAssets, domesticAssets.length + 1),
  ]

  const filtered = allAssets
    .filter(a => activeCategory === '전체' || a.category === activeCategory)
    .filter(a => {
      const q = searchQuery.trim().toLowerCase()
      if (!q) return true
      return a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
    })

  return (
    <div className="min-h-screen bg-background pb-8">
      <DashboardHeader
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="px-4 py-4">
        <div className="space-y-3">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              name={asset.name}
              symbol={asset.symbol}
              icon={asset.icon}
              targetAmount={asset.targetAmount}
              currentAmount={asset.currentAmount}
              secondBuyPrice={asset.secondBuyPrice}
              thirdBuyPrice={asset.thirdBuyPrice}
              takeProfitPrice={asset.takeProfitPrice}
              secondBuyMemo={asset.secondBuyMemo}
              thirdBuyMemo={asset.thirdBuyMemo}
              takeProfitMemo={asset.takeProfitMemo}
              color={asset.color}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
