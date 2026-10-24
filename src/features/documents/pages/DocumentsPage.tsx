import { useState } from 'react'
import { Search } from 'lucide-react'
import { PageContainer } from '@/app/layouts/PageContainer'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { DocumentsList } from '../components/DocumentsList'
import { DOCUMENT_STATUS_LABEL, DOCUMENT_TYPE_LABEL, type DocumentStatus, type DocumentType } from '../types'

const statusOptions = [{ value: '', label: 'All statuses' }, ...(Object.keys(DOCUMENT_STATUS_LABEL) as DocumentStatus[]).map((s) => ({ value: s, label: DOCUMENT_STATUS_LABEL[s] }))]
const typeOptions = [{ value: '', label: 'All types' }, ...(Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]).map((t) => ({ value: t, label: DOCUMENT_TYPE_LABEL[t] }))]

export function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DocumentStatus | ''>('')
  const [type, setType] = useState<DocumentType | ''>('')
  const q = useDebouncedValue(search)

  return (
    <PageContainer>
      <PageHeader title="Documents" />
      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_11rem_11rem]">
          <div className="relative">
            <label htmlFor="doc-search" className="sr-only">
              Search documents
            </label>
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-ink-3" aria-hidden />
            <input id="doc-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search file or company" className="h-9 w-full rounded-md border border-border-strong bg-surface pl-8 pr-3 text-sm placeholder:text-ink-3" />
          </div>
          <Select label="Status" hideLabel value={status} options={statusOptions} onChange={(e) => setStatus(e.target.value as DocumentStatus | '')} />
          <Select label="Type" hideLabel value={type} options={typeOptions} onChange={(e) => setType(e.target.value as DocumentType | '')} />
        </div>
        <DocumentsList query={{ search: q, status, type }} showCompany filtered={Boolean(q || status || type)} />
      </Card>
    </PageContainer>
  )
}
