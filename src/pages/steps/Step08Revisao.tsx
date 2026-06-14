import { useState } from 'react'
import { Levantamento } from '@/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { ReportPreview } from '@/components/report/ReportPreview'
import { CheckCircle2, AlertCircle, FileText, FileJson, Download } from 'lucide-react'
import { NIVEIS_RISCO } from '@/constants'

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
  toasts: { addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void }
}

export function Step08Revisao({ data, toasts }: Props) {
  const [showReport, setShowReport] = useState(false)

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `levantamento-${data.codigo || data.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toasts.addToast('success', 'Exportar JSON', 'Arquivo exportado com sucesso.')
  }
  const riscosPorCat = agrupar(data.riscos, 'categoria')
  const riscosPorNivel = agrupar(data.riscos, 'nivel')

  const checklist = [
    { label: 'Dados gerais preenchidos', ok: !!data.empresaNome },
    { label: 'Características do local preenchidas', ok: Object.keys(data.caracteristicas || {}).length > 0 },
    { label: 'Medições revisadas', ok: data.medicoes?.length > 0 },
    { label: 'Riscos cadastrados', ok: data.riscos?.length > 0 },
    { label: 'Controles revisados', ok: data.controles?.length > 0 },
    { label: 'Parecer técnico revisado', ok: !!data.parecer?.texto },
  ]

  if (showReport) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Pré-visualização do Relatório</h3>
          <button onClick={() => setShowReport(false)} className="text-sm text-brand-500 hover:text-brand-600">Voltar</button>
        </div>
        <ReportPreview levantamento={data} modelo="Completo" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Resumo Final do Levantamento</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="Empresa" value={data.empresaNome} />
          <SummaryCard label="CNPJ" value={data.cnpj} />
          <SummaryCard label="Código" value={data.codigo} />
          <SummaryCard label="Data" value={formatDate(data.dataLevantamento)} />
          <SummaryCard label="Ambientes" value={String(data.caracteristicas?.qtdColaboradores || 0)} />
          <SummaryCard label="Medições" value={String(data.medicoes?.length || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 border border-border rounded-lg">
          <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Riscos por Categoria</h4>
          <div className="space-y-1">
            {Object.entries(riscosPorCat).map(([cat, qtd]) => (
              <div key={cat} className="flex justify-between text-xs">
                <span className="text-text-secondary">{cat}</span>
                <span className="font-medium">{String(qtd)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border border-border rounded-lg">
          <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Riscos por Nível</h4>
          <div className="space-y-1">
            {Object.entries(riscosPorNivel).map(([nivel, qtd]) => (
              <div key={nivel} className="flex justify-between text-xs">
                <span className="text-text-secondary">{nivel}</span>
                <Badge variant={nivel === NIVEIS_RISCO.CRITICO ? 'risk-critical' : nivel === NIVEIS_RISCO.ALTO ? 'risk-high' : nivel === NIVEIS_RISCO.MODERADO ? 'risk-moderate' : 'risk-low'}>{String(qtd)}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Checklist de Validação</h4>
        <div className="space-y-1">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircle2 size={16} className="text-risk-low shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-risk-moderate shrink-0" />
              )}
              <span className={item.ok ? 'text-text-primary' : 'text-text-secondary'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
        <button onClick={() => setShowReport(true)} className="btn-secondary text-sm h-10">
          <FileText size={16} /> Visualizar Relatório
        </button>
        <button onClick={handleExportJSON} className="btn-secondary text-sm h-10">
          <FileJson size={16} /> Exportar JSON
        </button>
        <button onClick={() => toasts.addToast('info', 'Exportar CSV', 'Funcionalidade em desenvolvimento.')} className="btn-secondary text-sm h-10">
          <Download size={16} /> Exportar CSV
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 bg-gray-50 rounded-lg">
      <p className="text-[10px] text-text-secondary">{label}</p>
      <p className="text-xs font-medium text-text-primary truncate">{value || '-'}</p>
    </div>
  )
}

function agrupar<T>(arr: T[], key: keyof T): Record<string, number> {
  return (arr || []).reduce((acc: Record<string, number>, item: T) => {
    const k = String(item[key] || 'Outros')
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}


