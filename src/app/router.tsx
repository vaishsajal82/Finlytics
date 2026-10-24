import { createBrowserRouter, Link } from 'react-router-dom'
import { PageContainer } from './layouts/PageContainer'
import { AppLayout } from './layouts/AppLayout'
import type { RouteHandle } from './layouts/Header'
import { AssessmentsPage } from '@/features/assessments/pages/AssessmentsPage'
import { AssessmentWorkspacePage } from '@/features/assessments/pages/AssessmentWorkspacePage'
import { NewAssessmentPage } from '@/features/assessments/pages/NewAssessmentPage'
import { OverviewPage } from '@/features/dashboard/pages/OverviewPage'
import { DocumentsPage } from '@/features/documents/pages/DocumentsPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { RiskAnalysisPage } from '@/features/risk-analysis/pages/RiskAnalysisPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

const h = (label: string): RouteHandle => ({ crumbs: [{ label }] })

function NotFound() {
  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-ink-3">That address does not exist.</p>
      <Link to="/" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
        Go to Overview
      </Link>
    </PageContainer>
  )
}

export const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage />, handle: h('Overview') },
      { path: 'assessments', element: <AssessmentsPage />, handle: h('Assessments') },
      { path: 'assessments/new', element: <NewAssessmentPage />, handle: { crumbs: [{ label: 'Assessments', to: '/assessments' }, { label: 'New assessment' }] } satisfies RouteHandle },
      { path: 'assessments/:id', element: <AssessmentWorkspacePage />, handle: { crumbs: [{ label: 'Assessments', to: '/assessments' }], crumb: (p) => p.id ?? '' } satisfies RouteHandle },
      { path: 'documents', element: <DocumentsPage />, handle: h('Documents') },
      { path: 'risk', element: <RiskAnalysisPage />, handle: h('Risk Analysis') },
      { path: 'reports', element: <ReportsPage />, handle: h('Reports') },
      { path: 'settings', element: <SettingsPage />, handle: h('Settings') },
      { path: '*', element: <NotFound />, handle: h('Not found') },
    ],
  },
]

export const createRouter = () => createBrowserRouter(routes)
