import { PageContainer } from '@/app/layouts/PageContainer'
import { PageHeader } from '@/components/data-display/PageHeader'
import { RiskInvestigation } from '../components/RiskInvestigation'

export function RiskAnalysisPage() {
  return (
    <PageContainer>
      <PageHeader title="Risk Analysis" />
      <RiskInvestigation />
    </PageContainer>
  )
}
