import { PDFDownloadLink } from '@react-pdf/renderer'
import ReportDocument from './ReportDocument'
import type { Levantamento } from '@/types'

interface Props {
  levantamento: Levantamento
  fileName: string
  className?: string
  children?: React.ReactNode
}

export default function PdfDownloadInner({ levantamento, fileName, className, children }: Props) {
  return (
    <PDFDownloadLink document={<ReportDocument levantamento={levantamento} />} fileName={fileName} className={className}>
      {({ loading }) => (loading ? 'Gerando...' : children)}
    </PDFDownloadLink>
  )
}
