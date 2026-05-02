import { DashboardClient } from '@/components/dashboard-client'
import { fetchAssetData } from '@/lib/google-sheets'

export default async function DashboardPage() {
  const { domestic, us, prices } = await fetchAssetData()
  return <DashboardClient domesticAssets={domestic} usAssets={us} prices={prices} />
}
