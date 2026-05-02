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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
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
    secondBuyMemo: "",
    thirdBuyMemo: "",
    takeProfitMemo: "",
    color: "#E31937",
  },
]

const categories = ["전체", "원자재", "에너지", "암호화폐", "주식"]

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("전체")

  const filteredAssets = activeCategory === "전체"
    ? assetsData
    : assetsData.filter((asset) => asset.category === activeCategory)

  return (
    <div className="min-h-screen bg-background pb-8">
      <DashboardHeader
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
