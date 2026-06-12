import { useState } from 'react'
import { Assinatura, Levantamento } from '@/types'
import { formatDate, generateId } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { SignaturePad } from '@/components/forms/SignaturePad'
import { CheckCircle2, AlertCircle, FileDown, FileText, FileJson, Download, Check } from 'lucide-react'
import { NIVEIS_RISCO } from '@/constants'

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
  onFinish: () => void
  toasts: any
}

export function Step08Revisao({ data, updateData, onFinish, toasts }: Props) {
  const [showReport, setShowReport] = useState(false)
  const riscosPorCat = agrupar(data.riscos, 'categoria')
  const riscosPorNivel = agrupar(data.riscos, 'nivel')

  const checklist = [
    { label: 'Dados gerais preenchidos', ok: !!data.empresaNome && !!data.setor },
    { label: 'Características do local preenchidas', ok: !!data.caracteristicas?.setor },
    { label: 'Medições revisadas', ok: data.medicoes?.length > 0 },
    { label: 'Riscos cadastrados', ok: data.riscos?.length > 0 },
    { label: 'Controles revisados', ok: data.controles?.length > 0 },
    { label: 'Parecer técnico revisado', ok: !!data.parecer?.texto },
    { label: 'Assinatura do responsável técnico', ok: data.assinaturaTecnico?.confirmada },
    { label: 'Assinatura do representante da empresa', ok: data.assinaturaEmpresa?.confirmada },
  ]

  const allChecked = checklist.every(i => i.ok)

  const handleAssinaturaTecnico = (canvasData: string) => {
    updateData({ assinaturaTecnico: { ...data.assinaturaTecnico, canvasData } })
  }

  const confirmAssinaturaTecnico = () => {
    if (!data.assinaturaTecnico?.nomeCompleto || !data.assinaturaTecnico?.cpf) {
      toasts.addToast('error', 'Erro', 'Preencha nome e CPF antes de confirmar a assinatura.')
      return
    }
    updateData({
      assinaturaTecnico: {
        ...data.assinaturaTecnico,
        dataHora: new Date().toISOString(),
        confirmada: true
      }
    })
    toasts.addToast('success', 'Assinatura confirmada', 'Assinatura do responsável técnico registrada.')
  }

  const handleAssinaturaEmpresa = (canvasData: string) => {
    updateData({ assinaturaEmpresa: { ...data.assinaturaEmpresa, canvasData } })
  }

  const confirmAssinaturaEmpresa = () => {
    if (!data.assinaturaEmpresa?.nomeCompleto || !data.assinaturaEmpresa?.cpf) {
      toasts.addToast('error', 'Erro', 'Preencha nome e CPF antes de confirmar a assinatura.')
      return
    }
    updateData({
      assinaturaEmpresa: {
        ...data.assinaturaEmpresa,
        dataHora: new Date().toISOString(),
        confirmada: true
      }
    })
    toasts.addToast('success', 'Assinatura confirmada', 'Assinatura do representante da empresa registrada.')
  }

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
          <SummaryCard label="Unidade" value={data.unidade} />
          <SummaryCard label="Setor" value={data.setor} />
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

      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold text-text-primary mb-4">Assinaturas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-text-secondary">Responsável Técnico</h5>
            <label htmlFor="assinatura-tecnico-nome" className="sr-only">Nome completo do responsável técnico</label>
            <input
              id="assinatura-tecnico-nome"
              placeholder="Nome completo"
              value={data.assinaturaTecnico?.nomeCompleto || ''}
              onChange={(e) => updateData({ assinaturaTecnico: { ...data.assinaturaTecnico, nomeCompleto: e.target.value } })}
              className="w-full h-9 px-3 rounded-lg border border-border text-sm"
              disabled={data.assinaturaTecnico?.confirmada}
            />
            <label htmlFor="assinatura-tecnico-cpf" className="sr-only">CPF ou registro profissional do responsável técnico</label>
            <input
              id="assinatura-tecnico-cpf"
              placeholder="CPF ou Registro Profissional"
              value={data.assinaturaTecnico?.cpf || ''}
              onChange={(e) => updateData({ assinaturaTecnico: { ...data.assinaturaTecnico, cpf: e.target.value } })}
              className="w-full h-9 px-3 rounded-lg border border-border text-sm"
              disabled={data.assinaturaTecnico?.confirmada}
            />
            <SignaturePad
              value={data.assinaturaTecnico?.canvasData || ''}
              onChange={handleAssinaturaTecnico}
              label="Desenhe sua assinatura"
            />
            {data.assinaturaTecnico?.confirmada ? (
              <div className="flex items-center gap-2 text-risk-low text-sm font-medium">
                <Check size={16} /> Assinatura confirmada em {formatDate(data.assinaturaTecnico.dataHora)}
              </div>
            ) : (
              <button onClick={confirmAssinaturaTecnico} className="w-full h-9 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
                Confirmar Assinatura
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-text-secondary">Representante da Empresa</h5>
            <label htmlFor="assinatura-empresa-nome" className="sr-only">Nome completo do representante da empresa</label>
            <input
              id="assinatura-empresa-nome"
              placeholder="Nome completo"
              value={data.assinaturaEmpresa?.nomeCompleto || ''}
              onChange={(e) => updateData({ assinaturaEmpresa: { ...data.assinaturaEmpresa, nomeCompleto: e.target.value } })}
              className="w-full h-9 px-3 rounded-lg border border-border text-sm"
              disabled={data.assinaturaEmpresa?.confirmada}
            />
            <label htmlFor="assinatura-empresa-cpf" className="sr-only">CPF do representante da empresa</label>
            <input
              id="assinatura-empresa-cpf"
              placeholder="CPF"
              value={data.assinaturaEmpresa?.cpf || ''}
              onChange={(e) => updateData({ assinaturaEmpresa: { ...data.assinaturaEmpresa, cpf: e.target.value } })}
              className="w-full h-9 px-3 rounded-lg border border-border text-sm"
              disabled={data.assinaturaEmpresa?.confirmada}
            />
            <SignaturePad
              value={data.assinaturaEmpresa?.canvasData || ''}
              onChange={handleAssinaturaEmpresa}
              label="Desenhe sua assinatura"
            />
            {data.assinaturaEmpresa?.confirmada ? (
              <div className="flex items-center gap-2 text-risk-low text-sm font-medium">
                <Check size={16} /> Assinatura confirmada em {formatDate(data.assinaturaEmpresa.dataHora)}
              </div>
            ) : (
              <button onClick={confirmAssinaturaEmpresa} className="w-full h-9 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
                Confirmar Assinatura
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowReport(true)} className="flex items-center gap-1 h-9 px-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-gray-50">
            <FileText size={16} /> Visualizar Relatório
          </button>
          <button className="flex items-center gap-1 h-9 px-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-gray-50">
            <FileDown size={16} /> Gerar PDF
          </button>
          <button className="flex items-center gap-1 h-9 px-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-gray-50">
            <FileJson size={16} /> Exportar JSON
          </button>
          <button className="flex items-center gap-1 h-9 px-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-gray-50">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-4 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-gray-50">
            Solicitar Revisão
          </button>
          <button
            onClick={onFinish}
            disabled={!allChecked}
            className="flex items-center gap-1 h-9 px-4 bg-risk-low text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

function agrupar(arr: any[], key: string): Record<string, number> {
  return (arr || []).reduce((acc: Record<string, number>, item: any) => {
    const k = item[key] || 'Outros'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function ReportPreviewContent({ data, onBack }: { data: any; onBack: () => void }) {
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold mb-2">Identificação</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="text-text-secondary py-1 pr-2 w-40">Empresa:</td><td className="font-medium">{data.empresaNome}</td></tr>
                <tr><td className="text-text-secondary py-1 pr-2">CNPJ:</td><td className="font-medium">{data.cnpj}</td></tr>
                <tr><td className="text-text-secondary py-1 pr-2">Unidade:</td><td className="font-medium">{data.unidade}</td></tr>
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
                <tr><td className="text-text-secondary py-1 pr-2">Registro:</td><td className="font-medium">{data.registroMTE}</td></tr>
              </tbody>
            </table>
          </div>
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
              {(data.riscos || []).map((r: any) => (
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
        </div>
      </div>
    </div>
  )
}
