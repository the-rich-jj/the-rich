"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { CategoryTabs } from "@/components/category-tabs"
import { AssetCard } from "@/components/asset-card"
import { 
  Gem, 
  CircleDollarSign, 
  Cpu, 
  Flame, 
  Bitcoin, 
  Coins,
  Zap,
  Droplets,
  TrendingUp
} from "lucide-react"

// 샘플 데이터 (나중에 Google Sheets에서 가져올 예정)
const assetsData = [
  {
    id: 1,
    name: "금",
    symbol: "GOLD",
    icon: <Gem className="w-5 h-5" />,
    category: "원자재",
    targetAmount: 4000000,
    currentAmount: 2500000,
    secondBuyPrice: "₩95,000/g",
    thirdBuyPrice: "₩90,000/g",
    takeProfitPrice: "₩110,000/g",
    memo: "금리 인하 시 추가 매수 고려. 안전자산으로 포트폴리오 10% 유지.",
    color: "#F5A623",
  },
  {
    id: 2,
    name: "은",
    symbol: "SILVER",
    icon: <Coins className="w-5 h-5" />,
    category: "원자재",
    targetAmount: 2000000,
    currentAmount: 800000,
    secondBuyPrice: "₩1,100/g",
    thirdBuyPrice: "₩1,000/g",
    takeProfitPrice: "₩1,400/g",
    memo: "금 대비 저평가 구간에서 비중 확대 예정.",
    color: "#C0C0C0",
  },
  {
    id: 3,
    name: "구리",
    symbol: "COPPER",
    icon: <CircleDollarSign className="w-5 h-5" />,
    category: "원자재",
    targetAmount: 1500000,
    currentAmount: 1200000,
    secondBuyPrice: "$4.00/lb",
    thirdBuyPrice: "$3.80/lb",
    takeProfitPrice: "$4.80/lb",
    memo: "전기차 수요 증가에 따른 장기 투자.",
    color: "#B87333",
  },
  {
    id: 4,
    name: "천연가스",
    symbol: "NAT GAS",
    icon: <Flame className="w-5 h-5" />,
    category: "에너지",
    targetAmount: 1000000,
    currentAmount: 300000,
    secondBuyPrice: "$2.50",
    thirdBuyPrice: "$2.20",
    takeProfitPrice: "$3.50",
    memo: "겨울철 수요 증가 전 분할 매수 계획.",
    color: "#FF6B35",
  },
  {
    id: 5,
    name: "원유",
    symbol: "CRUDE OIL",
    icon: <Droplets className="w-5 h-5" />,
    category: "에너지",
    targetAmount: 2000000,
    currentAmount: 1500000,
    secondBuyPrice: "$70/bbl",
    thirdBuyPrice: "$65/bbl",
    takeProfitPrice: "$85/bbl",
    memo: "OPEC 감산 이슈 주시 필요.",
    color: "#1A1A2E",
  },
  {
    id: 6,
    name: "비트코인",
    symbol: "BTC",
    icon: <Bitcoin className="w-5 h-5" />,
    category: "암호화폐",
    targetAmount: 5000000,
    currentAmount: 3200000,
    secondBuyPrice: "$60,000",
    thirdBuyPrice: "$55,000",
    takeProfitPrice: "$100,000",
    memo: "반감기 후 상승 사이클 기대. DCA 전략 유지.",
    color: "#F7931A",
  },
  {
    id: 7,
    name: "이더리움",
    symbol: "ETH",
    icon: <Cpu className="w-5 h-5" />,
    category: "암호화폐",
    targetAmount: 3000000,
    currentAmount: 1800000,
    secondBuyPrice: "$3,000",
    thirdBuyPrice: "$2,500",
    takeProfitPrice: "$5,000",
    memo: "ETF 승인 기대감. 스테이킹 수익도 고려.",
    color: "#627EEA",
  },
  {
    id: 8,
    name: "솔라나",
    symbol: "SOL",
    icon: <Zap className="w-5 h-5" />,
    category: "암호화폐",
    targetAmount: 1500000,
    currentAmount: 600000,
    secondBuyPrice: "$120",
    thirdBuyPrice: "$100",
    takeProfitPrice: "$250",
    memo: "고성능 체인으로 생태계 확장 중. 변동성 주의.",
    color: "#00FFA3",
  },
  {
    id: 9,
    name: "테슬라",
    symbol: "TSLA",
    icon: <TrendingUp className="w-5 h-5" />,
    category: "주식",
    targetAmount: 3000000,
    currentAmount: 2100000,
    secondBuyPrice: "$180",
    thirdBuyPrice: "$160",
    takeProfitPrice: "$280",
    memo: "FSD 진행 상황 모니터링 중.",
    color: "#E31937",
  },
]

const categories = ["전체", "원자재", "에너지", "암호화폐", "주식"]

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("전체")

  const filteredAssets = activeCategory === "전체"
    ? assetsData
    : assetsData.filter((asset) => asset.category === activeCategory)

  const totalInvested = assetsData.reduce((sum, asset) => sum + asset.currentAmount, 0)
  const totalTarget = assetsData.reduce((sum, asset) => sum + asset.targetAmount, 0)

  return (
    <div className="min-h-screen bg-background pb-8">
      <DashboardHeader totalInvested={totalInvested} totalTarget={totalTarget} />
      
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="px-4 py-4">
        <div className="space-y-3">
          {filteredAssets.map((asset) => (
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
              memo={asset.memo}
              color={asset.color}
            />
          ))}
        </div>
      </main>

      {/* Bottom Safe Area */}
      <div className="h-6" />
    </div>
  )
}
