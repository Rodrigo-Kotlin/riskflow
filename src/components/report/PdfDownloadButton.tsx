import { useState, lazy, Suspense } from 'react'
import type { Levantamento } from '@/types'

const PdfDownloadInner = lazy(() => import('./PdfDownloadInner'))

interface Props {
  levantamento: Levantamento
  fileName: string
  className?: string
  children?: React.ReactNode
}

export function PdfDownloadButton({ levantamento, fileName, className, children }: Props) {
  const [show, setShow] = useState(false)

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className={className}>
        {children || 'Baixar PDF'}
      </button>
    )
  }

  return (
    <Suspense fallback={<span className={className}>Preparando PDF...</span>}>
      <PdfDownloadInner levantamento={levantamento} fileName={fileName} className={className}>
        {children}
      </PdfDownloadInner>
    </Suspense>
  )
}
