import { DashboardClient } from '@/components/dashboard-client'
import { fetchAssetData } from '@/lib/google-sheets'

export default async function DashboardPage() {
  const { domestic, us } = await fetchAssetData()
  return <DashboardClient domesticAssets={domestic} usAssets={us} />
}
