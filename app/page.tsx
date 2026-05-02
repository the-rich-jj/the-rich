"use client"
import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
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
    secondBuyMemo: "금리 인하 기대감 시 분할 매수 진입",
    thirdBuyMemo: "글로벌 경기 침체 헤지용 추가 확보",
    takeProfitMemo: "안전자산 포트폴리오 10% 비중 달성 시 익절",
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
    secondBuyMemo: "금/은 비율 저평가 구간 진입 시 매수",
    thirdBuyMemo: "산업 수요 감소로 과매도 시 저점 확보",
    takeProfitMemo: "금/은 비율 80:1 이하 정상화 시 익절",
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
    secondBuyMemo: "전기차 수요 둔화 우려로 일시 하락 시 매수",
    thirdBuyMemo: "중국 경기 부양책 발표 전 저점 선매수",
    takeProfitMemo: "전기차 보급 가속화 모멘텀 반영 시 익절",
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
    secondBuyMemo: "동절기 수요 증가 전 분할 매수 구간",
    thirdBuyMemo: "LNG 수출 확대로 공급 타이트 예상 시 추가",
    takeProfitMemo: "동절기 피크 수요 가격 반영 시 익절",
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
    secondBuyMemo: "OPEC 감산 결정 전 선매수 구간",
    thirdBuyMemo: "수요 우려로 과매도 시 저점 분할 매수",
    takeProfitMemo: "중동 리스크 프리미엄 최고조 시 익절",
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
    secondBuyMemo: "반감기 전 DCA 분할 매수 구간",
    thirdBuyMemo: "공포 탐욕 지수 20 이하 극도의 공포 시 매수",
    takeProfitMemo: "반감기 후 18개월 사이클 고점 구간에서 익절",
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
    secondBuyMemo: "현물 ETF 승인 이후 조정 시 추가 매수",
    thirdBuyMemo: "생태계 침체기 저점 DCA 구간",
    takeProfitMemo: "스테이킹 수익 포함 목표 수익률 달성 시 익절",
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
    secondBuyMemo: "DeFi TVL 급감 조정 시 진입",
    thirdBuyMemo: "네트워크 이슈 해결 후 재진입 구간",
    takeProfitMemo: "생태계 확장 모멘텀 정점에서 익절",
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
    secondBuyMemo: "FSD 규제 지연 이슈로 과도한 하락 시 매수",
    thirdBuyMemo: "전기차 수요 둔화 공포 극대화 시 분할 매수",
    takeProfitMemo: "FSD 완전 상용화 기대감 반영 고점에서 익절",
    color: "#E31937",
  },
]

const categories = ["전체", "원자재", "에너지", "암호화폐", "주식"]

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("전체")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAssets = assetsData
    .filter((asset) => activeCategory === "전체" || asset.category === activeCategory)
    .filter((asset) => {
      const q = searchQuery.trim().toLowerCase()
      if (!q) return true
      return asset.name.toLowerCase().includes(q) || asset.symbol.toLowerCase().includes(q)
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
              secondBuyMemo={asset.secondBuyMemo}
              thirdBuyMemo={asset.thirdBuyMemo}
              takeProfitMemo={asset.takeProfitMemo}
              color={asset.color}
            />
          ))}
        </div>
      </main>

      <div className="h-6" />
    </div>
  )
}
