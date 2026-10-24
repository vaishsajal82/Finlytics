import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  User,
  UserPlus,
} from 'lucide-react'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { useAuth, AuthError } from '../hooks/useAuth'

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { login, register, isAuthenticated, user } = useAuth()

  // Read mode from query param if provided (e.g. /auth?mode=register)
  const queryParams = new URLSearchParams(location.search)
  const initialMode = queryParams.get('mode') === 'register' ? 'register' : 'login'

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const [unregisteredId, setUnregisteredId] = useState<string | null>(null)

  // Form fields
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [organisation, setOrganisation] = useState('')

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  // If already authenticated and not trying to switch account, redirect
  if (isAuthenticated && user && !location.search.includes('switch=true')) {
    return <Navigate to={from} replace />
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setErrorBanner(null)
    setUnregisteredId(null)
    setLoading(true)

    try {
      const loggedUser = login(id, password)
      toast.success(`Welcome back, ${loggedUser.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof AuthError && err.code === 'user_not_found') {
        // Automatically redirect to Create Account view with this ID prefilled
        switchToRegisterWithId(id)
        toast.info(`No account found for "${id}". Let's create your account now.`)
        setErrorBanner(`No account found with ID "${id}". Please enter your details below to create your account.`)
      } else if (err instanceof AuthError) {
        setErrorBanner(err.message)
      } else {
        setErrorBanner('An unexpected error occurred during sign in.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setErrorBanner(null)
    setLoading(true)

    try {
      const newUser = register({
        id,
        name,
        password,
        role: role.trim() || undefined,
        organisation: organisation.trim() || undefined,
      })
      toast.success(`Account created successfully. Welcome, ${newUser.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setErrorBanner(err.message)
      } else {
        setErrorBanner('Could not complete registration. Please check the fields.')
      }
    } finally {
      setLoading(false)
    }
  }

  const switchToRegisterWithId = (suggestedId: string) => {
    setId(suggestedId)
    setMode('register')
    setErrorBanner(null)
    setUnregisteredId(null)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-canvas px-4 py-12 text-ink sm:px-6 lg:px-8">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[500px] rounded-full bg-blue-500/5 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-nav shadow-md">
            <svg
              aria-hidden="true"
              className="shrink-0"
              height="28"
              viewBox="0 0 32 32"
              width="28"
            >
              <rect fill="#1d3352" height="32" rx="7" width="32" />
              <path
                d="M9 22V10h13M9 16h9"
                fill="none"
                stroke="#2dd4bf"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Finlytics</h1>
          <p className="mt-1 text-xs text-ink-3">
            Evidence-driven financial due-diligence &amp; commercial credit workspace
          </p>
        </div>

        {/* Auth Container Card */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
          {/* Segmented Mode Selector */}
          <div className="mb-6 flex rounded-lg border border-border bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorBanner(null)
              }}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              Sign In with ID
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorBanner(null)
              }}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner with helpful action */}
          {errorBanner && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <p className="font-medium">{errorBanner}</p>
              {unregisteredId && (
                <button
                  type="button"
                  onClick={() => switchToRegisterWithId(unregisteredId)}
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-accent underline hover:text-accent-hover"
                >
                  <UserPlus className="size-3.5" />
                  Create a new account with &ldquo;{unregisteredId}&rdquo; &rarr;
                </button>
              )}
            </div>
          )}

          {/* Mode 1: Sign In Flow */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-2">Account ID or Email</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="size-4 text-ink-3" />
                  </div>
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. analyst.id@company.com or analyst_id"
                    className="w-full rounded-md border border-border-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-ink-2">Password</label>
                </div>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="size-4 text-ink-3" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-border-strong bg-surface py-2 pl-9 pr-10 text-sm text-ink placeholder:text-ink-3/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-3 hover:text-ink"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 font-medium shadow-sm transition-colors"
              >
                Sign In by ID
                <ArrowRight className="size-4" />
              </Button>

              <p className="mt-4 text-center text-xs text-ink-3">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setErrorBanner(null)
                  }}
                  className="font-medium text-accent hover:text-accent-hover hover:underline"
                >
                  Create account &rarr;
                </button>
              </p>
            </form>
          )}

          {/* Mode 2: Create Account (Register) Flow */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-ink-2">Account ID / Corporate Email</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="size-4 text-ink-3" />
                  </div>
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. your.id@company.com or analyst_id"
                    className="w-full rounded-md border border-border-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-2">Full Name</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="size-4 text-ink-3" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-md border border-border-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-2">Create Password</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="size-4 text-ink-3" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full rounded-md border border-border-strong bg-surface py-2 pl-9 pr-10 text-sm text-ink placeholder:text-ink-3/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-3 hover:text-ink"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-ink-2">Designation / Role</label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Briefcase className="size-3.5 text-ink-3" />
                    </div>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Credit Underwriter"
                      className="w-full rounded-md border border-border-strong bg-surface py-1.5 pl-8 pr-2.5 text-xs text-ink placeholder:text-ink-3/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-2">Organisation</label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Building2 className="size-3.5 text-ink-3" />
                    </div>
                    <input
                      type="text"
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="w-full rounded-md border border-border-strong bg-surface py-1.5 pl-8 pr-2.5 text-xs text-ink placeholder:text-ink-3/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="mt-2 w-full justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 font-medium shadow-sm transition-colors"
              >
                Register &amp; Launch Workspace
                <ArrowRight className="size-4" />
              </Button>

              <p className="mt-3 text-center text-xs text-ink-3">
                Already registered earlier?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorBanner(null)
                  }}
                  className="font-medium text-accent hover:text-accent-hover hover:underline"
                >
                  Sign in by that ID &rarr;
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Security Disclosures */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-ink-3">
          <CheckCircle2 className="size-3.5 text-accent" />
          <span>Statutory Due-Diligence System · End-to-End Enterprise Encrypted</span>
        </div>
      </div>
    </div>
  )
}
