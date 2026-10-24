import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageContainer } from '@/app/layouts/PageContainer'
import { PageHeader } from '@/components/data-display/PageHeader'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { ACCEPTED_UPLOADS, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { formatBytes } from '@/lib/formatters'
import { zodResolver } from '@/lib/zodResolver'
import { useProfile } from '../hooks/useProfile'

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  role: z.string().trim().max(80),
  organisation: z.string().trim().max(120),
})

export function SettingsPage() {
  const { profile, update } = useProfile()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({ resolver: zodResolver(schema), defaultValues: profile })

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Settings" />
      <div className="space-y-5">
        <Card>
          <CardHeader title="Profile" />
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
            <Input label="Role" {...register('role')} />
            <Input label="Organisation" {...register('organisation')} />
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" variant="primary" disabled={!isDirty}>
                Save profile
              </Button>
            </div>
          </form>
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
    </PageContainer>
  )
}
