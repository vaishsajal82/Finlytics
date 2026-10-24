import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Activity,
  Layers,
  Info,
} from 'lucide-react'

interface GraphNode {
  id: string
  label: string
  category: 'signal' | 'metric' | 'hypothesis' | 'source' | 'unresolved'
  status: 'supported' | 'contradicted' | 'unverified' | 'neutral'
  x: number // percentage 0-100
  y: number // percentage 0-100
  description: string
  evidenceDetails: string
}

const NODES: GraphNode[] = [
  {
    id: 'signal-root',
    label: 'Revenue vs OCF Divergence',
    category: 'signal',
    status: 'neutral',
    x: 50,
    y: 48,
    description: 'Primary Flagged Signal: Topline revenue increased while operating cash flow compressed.',
    evidenceDetails: 'Triggered when Revenue YoY grew by >25% while Operating Cash Flow declined >10% in the same fiscal period.',
  },
  {
    id: 'metric-rev',
    label: 'Revenue: +32.0%',
    category: 'metric',
    status: 'supported',
    x: 20,
    y: 24,
    description: 'Reported FY25 Revenue expanded to ₹48.24 Cr from ₹36.54 Cr in FY24.',
    evidenceDetails: 'Confirmed by statutory audited profit & loss statement (Schedule III compliant).',
  },
  {
    id: 'metric-ocf',
    label: 'OCF: -18.2%',
    category: 'metric',
    status: 'supported',
    x: 20,
    y: 72,
    description: 'Operating Cash Flow declined to ₹3.91 Cr despite strong book profits.',
    evidenceDetails: 'Cash flow statement shows significant cash absorption into working capital.',
  },
  {
    id: 'metric-dso',
    label: 'Debtor Days: 74d',
    category: 'metric',
    status: 'supported',
    x: 35,
    y: 86,
    description: 'Days Sales Outstanding widened by +22 days compared to FY24.',
    evidenceDetails: 'Trade receivables grew to ₹9.8 Cr, representing 74 days of annual revenue.',
  },
  {
    id: 'hypo-terms',
    label: 'Hypothesis: Credit Terms Eased',
    category: 'hypothesis',
    status: 'supported',
    x: 75,
    y: 22,
    description: 'Top corporate buyer renegotiated payment milestone terms from 45 to 75 days.',
    evidenceDetails: 'GST e-way bill dispatch schedules corroborate staggered delivery and receipt milestones.',
  },
  {
    id: 'hypo-bogus',
    label: 'Hypothesis: Circular Invoicing',
    category: 'hypothesis',
    status: 'contradicted',
    x: 82,
    y: 50,
    description: 'Testing if revenue was inflated through non-genuine invoice circularity.',
    evidenceDetails: 'CONTRADICTED: 36-month bank statements show direct real-time RTGS remittances from genuine counterparties.',
  },
  {
    id: 'hypo-solvency',
    label: 'Unresolved: Anchor Debtor Risk',
    category: 'unresolved',
    status: 'unverified',
    x: 75,
    y: 78,
    description: 'Receivables concentration: ₹4.8 Cr (49% of all debtors) is due from a single client.',
    evidenceDetails: 'UNRESOLVED: External credit rating for Anchor Client is not in repository. Requires reviewer follow-up.',
  },
  {
    id: 'source-mca',
    label: 'MCA & Tax Returns',
    category: 'source',
    status: 'supported',
    x: 32,
    y: 12,
    description: 'Statutory MCA electronic filings (AOC-4, MGT-7) and Income Tax returns.',
    evidenceDetails: '100% matched with Ministry of Corporate Affairs registrar repository.',
  },
]

interface Edge {
  from: string
  to: string
  status: 'supported' | 'contradicted' | 'unresolved' | 'neutral'
}

const EDGES: Edge[] = [
  { from: 'source-mca', to: 'metric-rev', status: 'supported' },
  { from: 'metric-rev', to: 'signal-root', status: 'supported' },
  { from: 'metric-ocf', to: 'signal-root', status: 'supported' },
  { from: 'metric-dso', to: 'signal-root', status: 'supported' },
  { from: 'signal-root', to: 'hypo-terms', status: 'supported' },
  { from: 'signal-root', to: 'hypo-bogus', status: 'contradicted' },
  { from: 'signal-root', to: 'hypo-solvency', status: 'unresolved' },
]

export function RiskGraphSection() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('signal-root')
  const activeNode = NODES.find((n) => n.id === selectedNodeId) ?? NODES[0]!

  return (
    <section id="risk-graph" className="relative py-24 sm:py-32 bg-[#09111e] text-slate-100 overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-accent/15 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[600px] rounded-full bg-blue-500/15 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">
            SIGNATURE INVESTIGATION VISUALIZATION
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            The Financial Risk Investigation Graph.
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Unlike static black-box alerts, Finlytics maps anomalous metrics to testable hypotheses,
            corroborating sources, and unresolved underwriting questions.
          </p>
        </div>

        {/* Graph & Inspector Container */}
        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          {/* Left / Main Network Canvas (SVG Interactive) */}
          <div className="relative rounded-2xl border border-slate-800 bg-[#060c16]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-teal-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive Risk Topology Map
                </span>
              </div>
              <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[9px] font-mono text-teal-300">
                CLICK NODES TO INSPECT
              </span>
            </div>

            {/* SVG Canvas Area */}
            <div className="relative mt-4 h-[380px] w-full select-none sm:h-[440px]">
              {/* Connecting Edges */}
              <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="edge-supported" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="edge-contradicted" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#9f1239" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="edge-unresolved" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {EDGES.map((edge) => {
                  const fromNode = NODES.find((n) => n.id === edge.from)
                  const toNode = NODES.find((n) => n.id === edge.to)
                  if (!fromNode || !toNode) return null

                  const isConnectedToSelected =
                    edge.from === selectedNodeId || edge.to === selectedNodeId

                  let strokeColor = 'rgba(255,255,255,0.15)'
                  if (edge.status === 'supported') strokeColor = 'url(#edge-supported)'
                  if (edge.status === 'contradicted') strokeColor = 'url(#edge-contradicted)'
                  if (edge.status === 'unresolved') strokeColor = 'url(#edge-unresolved)'

                  return (
                    <line
                      key={`${edge.from}-${edge.to}`}
                      x1={`${fromNode.x}%`}
                      y1={`${fromNode.y}%`}
                      x2={`${toNode.x}%`}
                      y2={`${toNode.y}%`}
                      stroke={strokeColor}
                      strokeWidth={isConnectedToSelected ? '0.6' : '0.3'}
                      strokeDasharray={edge.status === 'contradicted' ? '1.5 1' : undefined}
                      className="transition-all duration-300"
                    />
                  )
                })}
              </svg>

              {/* Interactive Nodes */}
              {NODES.map((node) => {
                const isSelected = node.id === selectedNodeId
                const isSignal = node.category === 'signal'

                let bgClass = 'bg-slate-900 border-slate-700 text-slate-200'
                if (node.status === 'supported') bgClass = 'border-teal-500/60 bg-teal-950/80 text-teal-200'
                if (node.status === 'contradicted') bgClass = 'border-rose-500/60 bg-rose-950/80 text-rose-200'
                if (node.status === 'unverified') bgClass = 'border-sky-500/60 bg-sky-950/80 text-sky-200'
                if (isSignal) bgClass = 'border-amber-400 bg-amber-950/90 text-amber-200 ring-2 ring-amber-400/30'

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-200 sm:text-xs shadow-md ${bgClass} ${
                      isSelected
                        ? 'scale-110 ring-2 ring-white shadow-teal-500/30 z-20'
                        : 'hover:scale-105 opacity-90 hover:opacity-100 z-10'
                    }`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    aria-label={`Inspect ${node.label}`}
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      {node.status === 'supported' && <CheckCircle2 className="size-3 text-teal-400" />}
                      {node.status === 'contradicted' && <XCircle className="size-3 text-rose-400" />}
                      {node.status === 'unverified' && <HelpCircle className="size-3 text-sky-400" />}
                      {isSignal && <AlertTriangle className="size-3.5 text-amber-400" />}
                      <span>{node.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Graph Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span>Flagged Signal</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-teal-400" />
                  <span>Supported</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-400" />
                  <span>Contradicted</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-sky-400" />
                  <span>Unresolved Question</span>
                </span>
              </div>
              <span className="font-mono text-[9px] text-slate-400">SYNTHETIC DEMO TOPOLOGY</span>
            </div>
          </div>

          {/* Right Node Inspector Sidebar */}
          <div className="rounded-2xl border border-slate-800 bg-[#060c16]/95 p-5 shadow-2xl backdrop-blur-xl lg:col-span-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-teal-400" />
                  <span className="text-xs font-bold uppercase text-white">Node Inspector</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                    activeNode.status === 'supported'
                      ? 'bg-teal-500/20 text-teal-300'
                      : activeNode.status === 'contradicted'
                      ? 'bg-rose-500/20 text-rose-300'
                      : activeNode.status === 'unverified'
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {activeNode.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                  {activeNode.category}
                </span>
                <h4 className="mt-1 text-lg font-bold text-white">{activeNode.label}</h4>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3.5 text-xs text-slate-300 leading-relaxed">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Investigation Finding:
                </span>
                {activeNode.description}
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300 leading-relaxed">
                <span className="text-[10px] font-bold text-teal-400 uppercase block mb-1">
                  Evidentiary Basis:
                </span>
                {activeNode.evidenceDetails}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Layers className="size-3.5 text-teal-400" />
                <span>All hypotheses remain cross-referenced to original uploaded file pages.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
