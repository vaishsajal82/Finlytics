import { Download, Eye, RotateCw } from 'lucide-react'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { toUserMessage } from '@/services/api/errors'
import { useGenerateReport } from '../hooks/useReports'
import type { Report } from '../types'
import { exportReportToPdf } from '../utils/pdfExport'

interface Props {
  report: Report
  onPreview?: (r: Report) => void
}

export function ReportActions({ report, onPreview }: Props) {
  const gen = useGenerateReport()
  const toast = useToast()

  const generate = () =>
    gen.mutate(report.assessmentId, {
      onSuccess: () => toast.success(`Report generated for ${report.companyName}.`),
      onError: (e) => toast.error(toUserMessage(e)),
    })

  const exportPdf = () => {
    try {
      exportReportToPdf(report)
      toast.success('Report downloaded in PDF format.')
    } catch {
      toast.error('Could not generate PDF.')
    }
  }

  if (report.status === 'ready') {
    return (
      <div className="flex flex-wrap justify-end gap-1.5">
        {onPreview && (
          <Button size="sm" onClick={() => onPreview(report)}>
            <Eye className="size-4" aria-hidden />
            Preview
          </Button>
        )}
        {report.fileUrl && (
          <a href={report.fileUrl} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-[13px] font-medium text-ink-2 hover:bg-surface-muted">
            <Download className="size-4" aria-hidden />
            Download file
          </a>
        )}
        <Button size="sm" onClick={exportPdf}>
          <Download className="size-4" aria-hidden />
          Export PDF
        </Button>
        <Button size="sm" variant="ghost" loading={gen.isPending} onClick={generate} aria-label={`Regenerate report for ${report.companyName}`}>
          <RotateCw className="size-4" aria-hidden />
        </Button>
      </div>
    )
  }
  return (
    <Button size="sm" variant={report.status === 'failed' ? 'secondary' : 'primary'} loading={gen.isPending || report.status === 'generating'} onClick={generate}>
      {report.status === 'failed' ? 'Retry generation' : 'Generate report'}
    </Button>
  )
}
