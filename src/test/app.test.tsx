import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/app/router'
import { ToastProvider } from '@/components/feedback/Toast'
import { ProfileProvider } from '@/features/settings/hooks/useProfile'
import { resetDemo } from '@/services/demo/db'

import { AuthProvider } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ProfileProvider>
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </ProfileProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  resetDemo()
  authService.register({
    id: 'priya.sharma@finlytics.ai',
    name: 'Priya Sharma',
    password: 'password123',
    role: 'Senior Underwriter',
    organisation: 'Finlytics Risk Analytics',
  })
})

describe('routes render', () => {
  it('overview shows recent assessments', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Recent assessments' })).toBeInTheDocument()
    expect((await screen.findAllByText('Meridian Packaging Pvt Ltd')).length).toBeGreaterThan(0)
  })

  it.each([
    ['/documents', 'Documents'],
    ['/risk', 'Risk Analysis'],
    ['/reports', 'Reports'],
    ['/settings', 'Settings'],
    ['/assessments/new', 'New assessment'],
  ])('%s renders its heading', async (path, heading) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('unknown assessment shows a not-found state', async () => {
    renderAt('/assessments/ASM-9999')
    expect(await screen.findByText('Assessment not found')).toBeInTheDocument()
  })
})

describe('assessments', () => {
  it('filters by search and shows an empty state', async () => {
    const user = userEvent.setup()
    renderAt('/assessments')
    expect(await screen.findByText('Kavya Agro Exports')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Search by company/), 'zzzz')
    expect(await screen.findByText('No assessments match these filters')).toBeInTheDocument()
  })

  it('validates the create form', async () => {
    const user = userEvent.setup()
    renderAt('/assessments/new')
    await user.click(await screen.findByRole('button', { name: 'Create and continue' }))
    expect(await screen.findByText('Enter the company name')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/^PAN/), 'bad')
    await user.click(screen.getByRole('button', { name: 'Create and continue' }))
    expect(await screen.findByText(/PAN should be 10 characters/)).toBeInTheDocument()
  })

  it('creates an assessment and lands in the upload stage', async () => {
    const user = userEvent.setup()
    renderAt('/assessments/new')
    await user.type(await screen.findByLabelText('Company name'), 'Test Co')
    await user.type(screen.getByLabelText('Assessment purpose'), 'Credit screening')
    await user.click(screen.getByRole('button', { name: 'Create and continue' }))
    expect(await screen.findByText('Drag and drop financial documents here')).toBeInTheDocument()
  })
})

describe('workspace data integrity', () => {
  it('shows calculated growth derived from the series, and flags missing data', async () => {
    renderAt('/assessments/ASM-1001?stage=analysis')
    expect(await screen.findByText('Revenue growth (YoY)')).toBeInTheDocument()
    expect(screen.getAllByText('+32.0%').length).toBeGreaterThan(0)
    expect(screen.getByText(/Interest expense was not itemised/)).toBeInTheDocument()
  })

  it('does not fabricate analysis for an assessment without data', async () => {
    renderAt('/assessments/ASM-1004?stage=analysis')
    expect(await screen.findByText('No financial analysis yet')).toBeInTheDocument()
  })

  it('labels simulated external evidence', async () => {
    renderAt('/risk')
    await waitFor(() => expect(screen.getAllByText(/Revenue grew while operating cash flow declined/).length).toBeGreaterThan(0))
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /A large customer may be delaying payments/ }))
    expect((await screen.findAllByText(/Simulated, not live-verified/)).length).toBeGreaterThan(0)
  })

  it('shows failed extraction with a retry option', async () => {
    renderAt('/assessments/ASM-1003?stage=extraction')
    expect(await screen.findByText(/OCR confidence fell below/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry extraction for brightwell/ })).toBeInTheDocument()
  })
})
