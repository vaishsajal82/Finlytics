import { z } from 'zod'

const optionalId = (re: RegExp, message: string) =>
  z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || re.test(v), message)

export const assessmentSchema = z.object({
  companyName: z.string().trim().min(2, 'Enter the company name').max(120, 'Keep the name under 120 characters'),
  purpose: z.string().trim().min(3, 'Describe the purpose, e.g. "Working-capital loan review"').max(160, 'Keep this under 160 characters'),
  cin: optionalId(/^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/, 'CIN should be 21 characters, e.g. U12345MH2010PTC123456'),
  gstin: optionalId(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'GSTIN should be 15 characters'),
  pan: optionalId(/^[A-Z]{5}\d{4}[A-Z]$/, 'PAN should be 10 characters, e.g. ABCDE1234F'),
  industry: z.string().trim().max(100).optional(),
  businessType: z.string().trim().max(100).optional(),
  requestedLoanAmount: z.coerce.number().min(0).optional(),
  currency: z.string().trim().default('INR').optional(),
  facilityType: z.string().trim().max(100).optional(),
  proposedTenure: z.string().trim().max(60).optional(),
  annualTurnover: z.coerce.number().min(0).optional(),
  existingDebt: z.coerce.number().min(0).optional(),
  operatingHistory: z.string().trim().max(100).optional(),
  assignedAnalyst: z.string().trim().max(100).optional(),
  assessmentDate: z.string().optional(),
  reportingPeriod: z.string().trim().max(60).optional(),
})

export type AssessmentFormValues = z.infer<typeof assessmentSchema>
