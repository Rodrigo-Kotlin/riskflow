import { useState } from 'react'
import { Levantamento } from '@/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle2, AlertCircle, FileText, FileJson, Download, Check } from 'lucide-react'
import { NIVEIS_RISCO } from '@/constants'

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
  onFinish: () => void
  toasts: { addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void }
}

export function Step08Revisao({ data, onFinish, toasts }: Props) {
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
    { label: 'Dados gerais preenchidos', ok: !!data.empresaNome && !!data.setor },
    { label: 'Características do local preenchidas', ok: !!data.caracteristicas?.setor },
    { label: 'Medições revisadas', ok: data.medicoes?.length > 0 },
    { label: 'Riscos cadastrados', ok: data.riscos?.length > 0 },
    { label: 'Controles revisados', ok: data.controles?.length > 0 },
    { label: 'Parecer técnico revisado', ok: !!data.parecer?.texto },
  ]

  const allChecked = checklist.every(i => i.ok)

  if (showReport) {
    return <ReportPreviewContent data={data} onBack={() => setShowReport(false)} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Resumo Final do Levantamento</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="Empresa" value={data.empresaNome} />
          <SummaryCard label="CNPJ" value={data.cnpj} />
          <SummaryCard label="Setor" value={data.setor} />
          <SummaryCard label="Código" value={data.codigo} />
          <SummaryCard label="Data" value={formatDate(data.dataLevantamento)} />
          <SummaryCard label="Responsável Técnico" value={data.auditorTecnico} />
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

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
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
        <div className="flex gap-2">
          <button
            onClick={onFinish}
            disabled={!allChecked}
            className="btn-primary bg-risk-low hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} /> Finalizar Levantamento
          </button>
        </div>
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

function ReportPreviewContent({ data, onBack }: { data: Levantamento; onBack: () => void }) {
  const c = data.caracteristicas || {} as Levantamento['caracteristicas']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Pré-visualização do Relatório</h3>
        <button onClick={onBack} className="text-sm text-brand-500 hover:text-brand-600">Voltar</button>
      </div>
      <div className="bg-white border border-border rounded-xl p-6 md:p-10 text-sm">
        <div className="text-center mb-8 pb-6 border-b-2 border-brand-500">
          <h1 className="text-xl font-bold text-text-primary">Efetiva RiskFlow — LPR/AEP Digital</h1>
          <p className="text-xs text-text-secondary mt-1">Levantamento de Perigos e Riscos / Análise Ergonômica Preliminar</p>
          {data.codigo && <p className="text-sm font-bold text-brand-500 mt-1">{data.codigo}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold mb-2">Identificação</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="text-text-secondary py-1 pr-2 w-40">Empresa:</td><td className="font-medium">{data.empresaNome}</td></tr>
                <tr><td className="text-text-secondary py-1 pr-2">CNPJ:</td><td className="font-medium">{data.cnpj}</td></tr>
                <tr><td className="text-text-secondary py-1 pr-2">Setor:</td><td className="font-medium">{data.setor}</td></tr>
                <tr><td className="text-text-secondary py-1 pr-2">Tipo:</td><td className="font-medium">{data.tipo}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2">Responsáveis</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="text-text-secondary py-1 pr-2 w-40">Responsável Empresa:</td><td className="font-medium">{data.responsavelEmpresa}</td></tr>
                <tr><td className="text-text-secondary py-1 pr-2">Auditor Técnico:</td><td className="font-medium">{data.auditorTecnico}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 pb-1 border-b border-border">Características do Local</h3>
          <table className="w-full text-xs">
            <tbody>
              {c.comprimento || c.largura ? (
                <tr><td className="text-text-secondary py-1 pr-2 w-40">Dimensões:</td><td className="font-medium">{c.comprimento || '0'}m x {c.largura || '0'}m</td></tr>
              ) : c.dimensoes ? (
                <tr><td className="text-text-secondary py-1 pr-2 w-40">Dimensões:</td><td className="font-medium">{c.dimensoes}</td></tr>
              ) : null}
              {c.peDireito ? <tr><td className="text-text-secondary py-1 pr-2">Pé-direito:</td><td className="font-medium">{c.peDireito}m</td></tr> : null}
              {c.pavimento ? <tr><td className="text-text-secondary py-1 pr-2">Pavimento:</td><td className="font-medium">{c.pavimento}º</td></tr> : null}
              {c.paredesVedacao ? <tr><td className="text-text-secondary py-1 pr-2">Paredes:</td><td className="font-medium">{c.paredesVedacao}</td></tr> : null}
              {c.piso ? <tr><td className="text-text-secondary py-1 pr-2">Piso:</td><td className="font-medium">{c.piso}</td></tr> : null}
              {c.forro ? <tr><td className="text-text-secondary py-1 pr-2">Forro:</td><td className="font-medium">{c.forro}</td></tr> : null}
              {c.telhado ? <tr><td className="text-text-secondary py-1 pr-2">Telhado:</td><td className="font-medium">{c.telhado}</td></tr> : null}
              {c.divisoria ? <tr><td className="text-text-secondary py-1 pr-2">Divisórias:</td><td className="font-medium">{c.divisoria}</td></tr> : null}
              {c.iluminacaoNatural ? <tr><td className="text-text-secondary py-1 pr-2">Iluminação Natural:</td><td className="font-medium">{c.iluminacaoNatural}</td></tr> : null}
              {c.iluminacaoArtificial ? <tr><td className="text-text-secondary py-1 pr-2">Iluminação Artificial:</td><td className="font-medium">{c.iluminacaoArtificial}</td></tr> : null}
              {c.ventilacaoNatural ? <tr><td className="text-text-secondary py-1 pr-2">Ventilação Natural:</td><td className="font-medium">{c.ventilacaoNatural}</td></tr> : null}
              {c.ventilacaoArtificial ? <tr><td className="text-text-secondary py-1 pr-2">Ventilação Artificial:</td><td className="font-medium">{c.ventilacaoArtificial}</td></tr> : null}
              {c.possibilidadeGES ? <tr><td className="text-text-secondary py-1 pr-2">Possibilidade GES:</td><td className="font-medium">{c.possibilidadeGES}</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 pb-1 border-b border-border">Inventário de Riscos</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 font-medium text-text-secondary">Perigo</th>
                <th className="text-left p-2 font-medium text-text-secondary">Categoria</th>
                <th className="text-center p-2 font-medium text-text-secondary">Score</th>
                <th className="text-center p-2 font-medium text-text-secondary">Nível</th>
              </tr>
            </thead>
            <tbody>
              {(data.riscos || []).map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-2 font-medium">{r.perigo}</td>
                  <td className="p-2">{r.categoria}</td>
                  <td className="p-2 text-center font-bold">{r.pontuacao}</td>
                  <td className="p-2 text-center">
                    <Badge variant={r.nivel === NIVEIS_RISCO.CRITICO ? 'risk-critical' : r.nivel === NIVEIS_RISCO.ALTO ? 'risk-high' : r.nivel === NIVEIS_RISCO.MODERADO ? 'risk-moderate' : 'risk-low'}>{r.nivel}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.parecer?.texto && (
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 pb-1 border-b border-border">Parecer Técnico</h3>
            <pre className="text-xs text-text-primary whitespace-pre-wrap font-sans">{data.parecer.texto}</pre>
          </div>
        )}

        <div className="text-center text-[10px] text-text-secondary mt-8 pt-4 border-t border-border">
          <p>Documento gerado pelo Efetiva RiskFlow — LPR/AEP Digital</p>
          <p>Data de emissão: {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  )
}
