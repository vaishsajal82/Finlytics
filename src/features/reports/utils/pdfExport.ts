import { jsPDF } from 'jspdf'
import type { Report } from '../types'

/**
 * Generates and downloads a complete, professional, multi-page PDF document
 * for the financial due diligence report.
 */
export function exportReportToPdf(report: Report) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = margin + 4

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage()
      y = margin + 6
      return true
    }
    return false
  }

  // Cover / Header Banner
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(37, 99, 235) // accent blue
  doc.text('FINLYTICS AI CREDIT INTELLIGENCE · DUE DILIGENCE APPRAISAL', margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text(report.companyName, margin, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139) // slate-500
  const dateStr = report.generatedAt ? new Date(report.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Current'
  doc.text(`Assessment ID: ${report.assessmentId}   |   Report Version: v${report.version ?? '2.4'}   |   Compiled: ${dateStr}`, margin, y)
  y += 4

  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // Preliminary Recommendation Card
  if (report.recommendation) {
    const rec = report.recommendation
    const rationaleLines = doc.splitTextToSize(rec.rationale, contentWidth - 10)
    const cardHeight = 24 + rationaleLines.length * 4.5

    checkPageBreak(cardHeight + 10)

    // Background card box
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD')

    // Verdict Tag
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(37, 99, 235)
    doc.text('PRELIMINARY CREDIT DECISION-SUPPORT VERDICT:', margin + 4, y + 6)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text(rec.verdict.toUpperCase().replace(/_/g, ' '), margin + 4, y + 12)

    // Underwriting Rationale
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(51, 65, 85)
    doc.text(rationaleLines, margin + 4, y + 18)

    y += cardHeight + 8
  }

  // Iterate through Sections A through Q
  for (const s of report.sections) {
    checkPageBreak(16)

    // Section Header
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    const cleanTitle = s.title.replace(/^[A-Z]\.\s*/, '')
    doc.text(`Section ${s.code || '·'}: ${cleanTitle}`, margin + 3, y + 5)
    y += 10

    // Section Body Paragraphs
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(51, 65, 85)

    for (const p of s.body) {
      const isBullet = p.startsWith('- ')
      const isDisclosure = p.includes('[DISCLOSURE]') || p.includes('[REGULATORY DISCLAIMER]')
      const textToWrap = isBullet ? p.slice(2) : p
      const indent = isBullet ? margin + 4 : margin
      const availableWidth = isBullet ? contentWidth - 4 : contentWidth
      const lines = doc.splitTextToSize(textToWrap, availableWidth)

      checkPageBreak(lines.length * 4.2 + 3)

      if (isDisclosure) {
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 116, 139)
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(51, 65, 85)
      }

      if (isBullet) {
        doc.circle(margin + 1.5, y + 1.2, 0.6, 'F')
      }

      doc.text(lines, indent, y + 2.5)
      y += lines.length * 4.2 + 2
    }

    y += 4
  }

  // Add running headers & footers to all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Running Header
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text('FINLYTICS AI CREDIT INTELLIGENCE · DUE DILIGENCE REPORT', margin, 10)
    doc.text(`${report.companyName} (${report.assessmentId})`, pageWidth - margin, 10, { align: 'right' })
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.2)
    doc.line(margin, 12, pageWidth - margin, 12)

    // Running Footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
    doc.text('Strictly Confidential · For Credit Appraisal & Underwriting Evaluation Only', margin, pageHeight - 8)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' })
  }

  // Download the PDF file
  const filename = `${report.companyName.replace(/\W+/g, '_')}_due_diligence_report.pdf`
  doc.save(filename)
}
