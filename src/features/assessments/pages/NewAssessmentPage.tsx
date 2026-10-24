import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/app/layouts/PageContainer'
import { useToast } from '@/components/feedback/Toast'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { AssessmentForm } from '../components/AssessmentForm'
import { useCreateAssessment } from '../hooks/useAssessments'

export function NewAssessmentPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const create = useCreateAssessment()

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="New assessment" />
      <Card>
        <CardHeader title="Company information" />
        <div className="p-4">
          <AssessmentForm
            submitLabel="Create and continue"
            onCancel={() => navigate('/assessments')}
            onSubmit={async (values) => {
              const a = await create.mutateAsync(values)
              toast.success(`Assessment ${a.id} created.`)
              navigate(`/assessments/${a.id}?stage=documents`)
            }}
          />
        </div>
      </Card>
    </PageContainer>
  )
}
