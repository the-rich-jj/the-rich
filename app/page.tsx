import { DashboardClient } from '@/components/dashboard-client'
import { fetchAssetNames } from '@/lib/google-sheets'

export default async function DashboardPage() {
  const { domestic, us } = await fetchAssetNames()
  return <DashboardClient domesticAssets={domestic} usAssets={us} />
}
