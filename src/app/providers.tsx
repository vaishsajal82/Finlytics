import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { ToastProvider } from '@/components/feedback/Toast'
import { ProfileProvider } from '@/features/settings/hooks/useProfile'
import { ApiError } from '@/services/api/errors'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            // Retry transient failures only; never retry client errors.
            retry: (count, err) => !(err instanceof ApiError && err.kind !== 'network' && err.kind !== 'server') && count < 2,
          },
        },
      }),
  )
  return (
    <QueryClientProvider client={client}>
      <ProfileProvider>
        <ToastProvider>{children}</ToastProvider>
      </ProfileProvider>
    </QueryClientProvider>
  )
}
