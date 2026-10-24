import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { zodResolver } from '@/lib/zodResolver'
import { ApiError } from '@/services/api/errors'
import { assessmentSchema, type AssessmentFormValues } from '../schemas/assessmentSchema'

interface Props {
  defaultValues?: Partial<AssessmentFormValues>
  submitLabel: string
  onSubmit: (values: AssessmentFormValues) => Promise<unknown>
  onCancel?: () => void
}


export function AssessmentForm({ defaultValues, submitLabel, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      companyName: '',
      purpose: '',
      cin: '',
      gstin: '',
      pan: '',
      industry: '',
      businessType: '',
      requestedLoanAmount: undefined,
      currency: 'INR',
      facilityType: '',
      proposedTenure: '',
      annualTurnover: undefined,
      existingDebt: undefined,
      operatingHistory: '',
      assignedAnalyst: '',
      reportingPeriod: '',
      assessmentDate: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fieldErrors).length) {
        for (const [k, msg] of Object.entries(e.fieldErrors)) setError(k as keyof AssessmentFormValues, { message: msg })
      } else {
        setError('root', { message: e instanceof Error ? e.message : 'Could not save the assessment.' })
      }
    }
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-[13px] font-medium text-ink-2">Borrower & Facility Request</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company name"
            autoComplete="organization"
            placeholder="e.g. Meridian Packaging Pvt Ltd"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
          <Input
            label="Assessment purpose"
            placeholder="e.g. Working Capital Credit Facility Assessment"
            hint="State facility objective and credit context"
            error={errors.purpose?.message}
            {...register('purpose')}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Input
            label="Requested amount"
            type="number"
            step="100000"
            placeholder="20000000"
            hint="In base currency units (e.g. ₹2,00,00,000)"
            error={errors.requestedLoanAmount?.message}
            {...register('requestedLoanAmount')}
          />
          <Input
            label="Currency"
            placeholder="INR"
            defaultValue="INR"
            error={errors.currency?.message}
            {...register('currency')}
          />
          <Input
            label="Facility type"
            placeholder="e.g. Working Capital Overdraft / CC"
            error={errors.facilityType?.message}
            {...register('facilityType')}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Proposed tenure"
            placeholder="e.g. 12 Months Revolving (Annual Review)"
            error={errors.proposedTenure?.message}
            {...register('proposedTenure')}
          />
          <Input
            label="Reporting period"
            placeholder="e.g. FY 2024-25 (Audited) + Q4 Management Accounts"
            error={errors.reportingPeriod?.message}
            {...register('reportingPeriod')}
          />
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-[13px] font-medium text-ink-2">Business Profile & Baseline Financials</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Industry sector"
            placeholder="e.g. Industrial Packaging"
            error={errors.industry?.message}
            {...register('industry')}
          />
          <Input
            label="Business type / Constitution"
            placeholder="e.g. Private Limited SME"
            error={errors.businessType?.message}
            {...register('businessType')}
          />
          <Input
            label="Operating history"
            placeholder="e.g. 8 years (Incorp. 2016)"
            error={errors.operatingHistory?.message}
            {...register('operatingHistory')}
          />
        </div>

      </fieldset>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-[13px] font-medium text-ink-2">Company identifiers</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="CIN" className="uppercase" placeholder="U21022MH2016PTC284910" error={errors.cin?.message} {...register('cin')} />
          <Input label="GSTIN" className="uppercase" placeholder="27AABCM8291Q1ZM" error={errors.gstin?.message} {...register('gstin')} />
          <Input label="PAN" className="uppercase" placeholder="AABCM8291Q" error={errors.pan?.message} {...register('pan')} />
        </div>
      </fieldset>

      {errors.root?.message && (
        <p role="alert" className="rounded-md border border-[#f5c2bd] bg-risk-high-soft px-3 py-2 text-sm text-risk-high">
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={defaultValues && !isDirty}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

