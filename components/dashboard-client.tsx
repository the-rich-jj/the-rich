"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AssetCard } from "@/components/asset-card"
import { DomesticStockCard } from "@/components/domestic-stock-card"
import type { CoinAsset, DomesticAsset, DomesticStock, PriceData, UsAsset } from "@/lib/google-sheets"
import {
  Gem, CircleDollarSign, Cpu, Flame, Bitcoin, Coins, Zap,
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
  transferAmount: number
  currentPriceKRW?: number
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
  '은':                                    { symbol: 'SLV',     icon: <Coins className="w-5 h-5" />,         color: '#959595', category: '원자재' },
  '구리':                                  { symbol: 'FCX',     icon: <CircleDollarSign className="w-5 h-5" />, color: '#B87333', category: '원자재' },
  '천연가스':                              { symbol: 'LNG',     icon: <Flame className="w-5 h-5" />,         color: '#FF6B35', category: '원자재' },
  '비트코인':                              { symbol: 'BTC',     icon: <Bitcoin className="w-5 h-5" />,       color: '#F7931A', category: '암호화폐' },
  '이더리움':                              { symbol: 'ETH',     icon: <Zap className="w-5 h-5" />,           color: '#627EEA', category: '암호화폐' },
  '리플':                                  { symbol: 'XRP',     icon: <TrendingUp className="w-5 h-5" />,    color: '#00AAE4', category: '암호화폐' },
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

function buildDomesticAssets(entries: DomesticAsset[], prices: Record<string, PriceData>, startId: number): AssetData[] {
  return entries.map((entry, idx) => {
    const config = ASSET_CONFIG[entry.name] ?? {
      symbol: entry.name.split(' ')[0].toUpperCase().slice(0, 6),
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#6B7280',
      category: '원자재',
    }
    const p = prices[entry.name] ?? {}
    return {
      id: startId + idx,
      name: entry.name,
      ...config,
      currentAmount: entry.currentAmount,
      targetAmount: entry.targetAmount,
      transferAmount: entry.transferAmount,
      currentPriceKRW: entry.currentPrice,
      secondBuyPrice: p.secondBuyPrice ?? '',
      secondBuyMemo: p.secondBuyMemo ?? '',
      thirdBuyPrice: p.thirdBuyPrice ?? '',
      thirdBuyMemo: p.thirdBuyMemo ?? '',
      takeProfitPrice: p.takeProfitPrice ?? '',
      takeProfitMemo: p.takeProfitMemo ?? '',
    }
  })
}

function buildCoinAssets(coins: CoinAsset[], prices: Record<string, PriceData>, startId: number): AssetData[] {
  return coins.map((coin, idx) => {
    const config = ASSET_CONFIG[coin.name] ?? {
      symbol: coin.ticker,
      icon: <Bitcoin className="w-5 h-5" />,
      color: '#F7931A',
      category: '암호화폐',
    }
    const p = prices[coin.name] ?? {}
    return {
      id: startId + idx,
      name: coin.name,
      ...config,
      currentAmount: coin.currentAmount,
      targetAmount: 0,
      transferAmount: 0,
      currentPriceKRW: coin.currentPriceKRW,
      secondBuyPrice: p.secondBuyPrice ?? '',
      secondBuyMemo: p.secondBuyMemo ?? '',
      thirdBuyPrice: p.thirdBuyPrice ?? '',
      thirdBuyMemo: p.thirdBuyMemo ?? '',
      takeProfitPrice: p.takeProfitPrice ?? '',
      takeProfitMemo: p.takeProfitMemo ?? '',
    }
  })
}

function buildUsAssets(assets: UsAsset[], prices: Record<string, PriceData>, startId: number): AssetData[] {
  return assets.map((asset, idx) => {
    const config = ASSET_CONFIG[asset.name] ?? {
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#6B7280',
      category: '미국주식',
    }
    const p = prices[asset.name] ?? {}
    return {
      id: startId + idx,
      name: asset.name,
      ...config,
      symbol: asset.ticker || asset.name.split(' ')[0].toUpperCase().slice(0, 6),
      currentAmount: asset.currentAmount,
      targetAmount: asset.targetAmount,
      transferAmount: asset.transferAmount,
      currentPriceKRW: asset.currentPriceKRW,
      secondBuyPrice: p.secondBuyPrice ?? '',
      secondBuyMemo: p.secondBuyMemo ?? '',
      thirdBuyPrice: p.thirdBuyPrice ?? '',
      thirdBuyMemo: p.thirdBuyMemo ?? '',
      takeProfitPrice: p.takeProfitPrice ?? '',
      takeProfitMemo: p.takeProfitMemo ?? '',
    }
  })
}

const categories = ['전체', '원자재', '미국주식', '국내주식', '암호화폐']

interface Props {
  domesticAssets: DomesticAsset[]
  usAssets: UsAsset[]
  prices: Record<string, PriceData>
  domesticStocks: DomesticStock[]
  totalEvalAmount: number
  initialTierTargets: Record<string, number>
  coins: CoinAsset[]
}

const CRYPTO_NAMES = new Set(['비트코인', '알트코인'])

export function DashboardClient({ domesticAssets, usAssets, prices, domesticStocks, totalEvalAmount, initialTierTargets, coins }: Props) {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [tierTargets, setTierTargets] = useState<Record<string, number>>(initialTierTargets)

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateTierTarget = (tier: string, v: number) => {
    setTierTargets(prev => ({ ...prev, [tier]: v }))
    fetch('/api/update-tier-target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, value: v }),
    }).catch(() => {})
  }

  const commodityAssets = domesticAssets.filter(a => !CRYPTO_NAMES.has(a.name))
  const allAssets: AssetData[] = [
    ...buildDomesticAssets(commodityAssets, prices, 1),
    ...buildUsAssets(usAssets, prices, commodityAssets.length + 1),
    ...buildCoinAssets(coins, prices, commodityAssets.length + usAssets.length + 1),
  ]

  const filtered = allAssets
    .filter(a => activeCategory === '전체' || a.category === activeCategory)
    .filter(a => {
      const q = searchQuery.trim().toLowerCase()
      if (!q) return true
      return a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
    })

  // 국내주식 tier 집계
  const tierGroups = domesticStocks.reduce((acc, s) => {
    if (!acc[s.tier]) acc[s.tier] = { count: 0, heldRatio: 0, stocks: [] }
    acc[s.tier].count++
    acc[s.tier].heldRatio += s.heldRatio
    if (s.name) acc[s.tier].stocks.push(s.name)
    return acc
  }, {} as Record<string, { count: number; heldRatio: number; stocks: string[] }>)

  const renderAssetCards = (assets: AssetData[]) =>
    assets.map(asset => (
      <AssetCard
        key={asset.id}
        name={asset.name}
        symbol={asset.symbol}
        icon={asset.icon}
        targetAmount={asset.targetAmount}
        currentAmount={asset.currentAmount}
        transferAmount={asset.transferAmount}
        currentPriceKRW={asset.currentPriceKRW}
        secondBuyPrice={asset.secondBuyPrice}
        thirdBuyPrice={asset.thirdBuyPrice}
        takeProfitPrice={asset.takeProfitPrice}
        secondBuyMemo={asset.secondBuyMemo}
        thirdBuyMemo={asset.thirdBuyMemo}
        takeProfitMemo={asset.takeProfitMemo}
        color={asset.color}
      />
    ))

  const q = searchQuery.trim().toLowerCase()
  const searchFilter = (a: AssetData) =>
    !q || a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
  const tierFilter = (tier: string) => {
    const group = tierGroups[tier]
    if (!group) return false
    if (!q) return true
    return group.stocks.some(s => s.toLowerCase().includes(q)) ||
      `${tier}티어`.includes(q)
  }

  const renderTierCards = () =>
    ['1', '2', '3'].filter(tierFilter).map(tier => {
      const group = tierGroups[tier]!
      return (
        <DomesticStockCard
          key={tier}
          tier={tier}
          stockCount={group.count}
          heldRatio={group.heldRatio}
          targetRatio={tierTargets[tier]}
          totalEvalAmount={totalEvalAmount}
          stocks={group.stocks}
          onTargetChange={v => updateTierTarget(tier, v)}
        />
      )
    })

  const renderContent = () => {
    if (activeCategory === '국내주식') return renderTierCards()
    if (activeCategory === '전체') return (
      <>
        {renderAssetCards(allAssets.filter(a => a.category === '원자재' && searchFilter(a)))}
        {renderAssetCards(allAssets.filter(a => a.category === '미국주식' && searchFilter(a)))}
        {renderTierCards()}
        {renderAssetCards(allAssets.filter(a => a.category === '암호화폐' && searchFilter(a)))}
      </>
    )
    return renderAssetCards(filtered)
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <DashboardHeader
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
