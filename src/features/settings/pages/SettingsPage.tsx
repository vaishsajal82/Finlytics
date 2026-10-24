import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { CheckCircle2, XCircle } from 'lucide-react'
import { z } from 'zod'
import { PageContainer } from '@/app/layouts/PageContainer'
import { PageHeader } from '@/components/data-display/PageHeader'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Field'
import { ACCEPTED_UPLOADS, API_BASE_URL, DATA_MODE, IS_DEMO, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { formatBytes } from '@/lib/formatters'
import { zodResolver } from '@/lib/zodResolver'
import { toUserMessage } from '@/services/api/errors'
import { resetDemo } from '@/services/demo/db'
import { useProfile } from '../hooks/useProfile'
import { checkHealth } from '../services/settingsService'

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  role: z.string().trim().max(80),
  organisation: z.string().trim().max(120),
})

export function SettingsPage() {
  const { profile, update } = useProfile()
  const toast = useToast()
  const qc = useQueryClient()
  const [health, setHealth] = useState<{ ok: boolean; text: string } | 'checking' | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({ resolver: zodResolver(schema), defaultValues: profile })

  const runHealth = async () => {
    setHealth('checking')
    try {
      const r = await checkHealth()
      setHealth({ ok: true, text: `Reachable (status: ${r.status}${r.version ? `, v${r.version}` : ''})` })
    } catch (e) {
      setHealth({ ok: false, text: toUserMessage(e) })
    }
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Settings" />
      <div className="space-y-5">
        <Card>
          <CardHeader title="Profile" description="Stored in this browser only. Used to attribute analyst notes." />
          <form
            noValidate
            className="grid gap-4 p-4 sm:grid-cols-3"
            onSubmit={handleSubmit((v) => {
              update(v)
              reset(v)
              toast.success('Profile saved.')
            })}
          >
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Input label="Role" optional {...register('role')} />
            <Input label="Organisation" optional {...register('organisation')} />
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" variant="primary" disabled={!isDirty}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Data source" description="Set with VITE_DATA_MODE and VITE_API_BASE_URL in frontend/.env, then restart the dev server." />
          <div className="space-y-4 p-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-3">Mode</dt>
                <dd className="mt-0.5">
                  <Badge tone={IS_DEMO ? 'medium' : 'accent'}>{DATA_MODE === 'demo' ? 'Standard Analytics' : 'Live API'}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">API base URL</dt>
                <dd className="mt-0.5 font-mono text-[13px]">{API_BASE_URL}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => void runHealth()} loading={health === 'checking'}>
                Check API connection
              </Button>
              {health && health !== 'checking' && (
                <p role="status" className={`flex items-center gap-1.5 ${health.ok ? 'text-risk-low' : 'text-risk-high'}`}>
                  {health.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
                  {health.text}
                </p>
              )}
            </div>
            {IS_DEMO && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-ink-2">Workspace changes (new assessments, notes, uploads) are saved locally. Reset to restore the default dataset.</p>
                <Button variant="danger" onClick={() => setConfirmReset(true)}>
                  Reset workspace data
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Upload constraints" description="Enforced in the browser before upload. Keep in sync with the backend." />
          <dl className="grid gap-3 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-3">Accepted formats</dt>
              <dd className="mt-0.5">{ACCEPTED_UPLOADS.map((f) => f.ext).join(', ')}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Maximum size per file</dt>
              <dd className="num mt-0.5">{formatBytes(MAX_UPLOAD_BYTES)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset workspace data?"
        description="This removes newly created records and restores the baseline assessments."
        confirmLabel="Reset workspace data"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo()
          void qc.invalidateQueries()
          setConfirmReset(false)
          toast.success('Workspace data reset.')
        }}
      />
    </PageContainer>
  )
}
