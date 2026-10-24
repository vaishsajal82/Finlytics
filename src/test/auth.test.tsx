import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/app/router'
import { ToastProvider } from '@/components/feedback/Toast'
import { ProfileProvider } from '@/features/settings/hooks/useProfile'
import { AuthProvider } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'
import { resetDemo } from '@/services/demo/db'

function renderAuthAt(path: string = '/auth') {
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
})

describe('Auth workflows', () => {
  it('unauthenticated user at "/" sees the public 3D fintech landing page', async () => {
    renderAuthAt('/')
    expect(await screen.findByRole('heading', { name: /See Beyond the/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore Finlytics' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Sign In' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Get Started/ }).length).toBeGreaterThan(0)
  })

  it('redirects unauthenticated user from protected route to /auth and defaults to Sign In view', async () => {
    renderAuthAt('/assessments')
    expect(await screen.findByRole('heading', { name: 'Finlytics' })).toBeInTheDocument()
    // Defaults to Sign In view first
    expect(screen.getByRole('button', { name: 'Sign In by ID' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e\.g\. analyst\.id@company\.com/)).toBeInTheDocument()
  })

  it('allows switching between Sign In and Create Account views', async () => {
    const user = userEvent.setup()
    renderAuthAt('/auth')

    // Initial default is Sign In
    expect(screen.getByRole('button', { name: 'Sign In by ID' })).toBeInTheDocument()

    // Switch to Create Account via tab
    await user.click(screen.getByRole('button', { name: 'Create Account' }))
    expect(screen.getByRole('button', { name: 'Register & Launch Workspace' })).toBeInTheDocument()

    // Switch back to Sign In
    await user.click(screen.getByRole('button', { name: 'Sign In with ID' }))
    expect(screen.getByRole('button', { name: 'Sign In by ID' })).toBeInTheDocument()
  })

  it('automatically redirects to create account with pre-filled ID when user has no account', async () => {
    const user = userEvent.setup()
    renderAuthAt('/auth')

    // Enter non-existent ID on the initial Sign In view
    const idInput = screen.getByPlaceholderText(/e\.g\. analyst\.id@company\.com/)
    const passInput = screen.getByPlaceholderText('Enter your password')
    await user.type(idInput, 'brand_new_analyst@bank.com')
    await user.type(passInput, 'secret123')
    await user.click(screen.getByRole('button', { name: 'Sign In by ID' }))

    // System automatically switches to the Create Account registration form
    expect(await screen.findByRole('button', { name: 'Register & Launch Workspace' })).toBeInTheDocument()
    expect(await screen.findByText(/No account found with ID/)).toBeInTheDocument()

    // ID is automatically pre-filled
    const regIdInput = screen.getByPlaceholderText(/e\.g\. your\.id@company\.com/) as HTMLInputElement
    expect(regIdInput.value).toBe('brand_new_analyst@bank.com')
  })

  it('allows clicking "Create account ->" link to switch to registration', async () => {
    const user = userEvent.setup()
    renderAuthAt('/auth')

    // Click the bottom link "Create account ->"
    await user.click(screen.getByRole('button', { name: /Create account/ }))
    expect(screen.getByRole('button', { name: 'Register & Launch Workspace' })).toBeInTheDocument()

    // Fill registration form and enter workspace
    const idInput = screen.getByPlaceholderText(/e\.g\. your\.id@company\.com/)
    const nameInput = screen.getByPlaceholderText('e.g. Priya Sharma')
    const passInput = screen.getByPlaceholderText('At least 4 characters')

    await user.type(idInput, 'rohit.mehta@finlytics.ai')
    await user.type(nameInput, 'Rohit Mehta')
    await user.type(passInput, 'rohitPass1')

    await user.click(screen.getByRole('button', { name: 'Register & Launch Workspace' }))

    // Successfully logged in and routed to dashboard overview
    expect(await screen.findByRole('heading', { name: 'Recent assessments' })).toBeInTheDocument()
  })

  it('allows logging in with an existing registered user ID', async () => {
    // Seed legitimate user account
    authService.register({
      id: 'existing.analyst@bank.com',
      name: 'Existing Analyst',
      password: 'password999',
      role: 'Risk Specialist',
      organisation: 'Apex Bank',
    })
    authService.logout()

    const user = userEvent.setup()
    renderAuthAt('/auth')

    // Default view is already Sign In
    const idInput = screen.getByPlaceholderText(/e\.g\. analyst\.id@company\.com/)
    const passInput = screen.getByPlaceholderText('Enter your password')

    await user.type(idInput, 'existing.analyst@bank.com')
    await user.type(passInput, 'password999')
    await user.click(screen.getByRole('button', { name: 'Sign In by ID' }))

    // Should navigate to dashboard overview
    expect(await screen.findByRole('heading', { name: 'Recent assessments' })).toBeInTheDocument()
  })
})
