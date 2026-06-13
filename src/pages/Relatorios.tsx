import { useState, useMemo } from 'react'
import { Levantamento, Relatorio } from '@/types'
import { useLevantamentos } from '@/hooks/useLevantamentos'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { formatDate, generateId } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReportPreview } from '@/components/report/ReportPreview'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { PDFDownloadLink } from '@react-pdf/renderer'
import ReportDocument from '@/components/report/ReportDocument'
import { FileText, Search, Eye, Download, ArrowLeft } from 'lucide-react'
import { STATUS_LEVANTAMENTO } from '@/constants'

const ITENS_POR_PAGINA = 20

export function Relatorios() {
  const { levantamentos, loading: levantamentosLoading } = useLevantamentos()
  const [relatorios, setRelatorios] = useLocalStorage<Relatorio[]>('riskflow_relatorios', [])
  const [search, setSearch] = useState('')
  const [previewLev, setPreviewLev] = useState<Levantamento | null>(null)
  const [modelo, setModelo] = useState<'Completo' | 'Executivo'>('Completo')
  const loading = levantamentosLoading
  const [pagina, setPagina] = useState(1)



  const concluidos = useMemo(() => levantamentos.filter(l => l.status === STATUS_LEVANTAMENTO.CONCLUIDO), [levantamentos])

  const gerarRelatorio = (l: Levantamento) => {
    const exists = relatorios.find(r => r.levantamentoId === l.id)
    if (exists) {
      setPreviewLev(l)
      return
    }
    const novo: Relatorio = {
      id: generateId(), levantamentoId: l.id, empresaNome: l.empresaNome,
      tipo: l.tipo, data: new Date().toISOString().split('T')[0],
      modelo: 'Completo', status: 'Gerado', createdAt: new Date().toISOString()
    }
    setRelatorios(prev => [...prev, novo])
    setPreviewLev(l)
  }

  const allRelatorios = useMemo(() => [
    ...relatorios,
    ...concluidos.filter(l => !relatorios.find(r => r.levantamentoId === l.id)).map(l => ({
      id: l.id, levantamentoId: l.id, empresaNome: l.empresaNome,
      tipo: l.tipo, data: new Date().toISOString().split('T')[0],
      modelo: 'Completo' as const, status: 'Disponível' as const, createdAt: l.createdAt
    }))
  ], [relatorios, concluidos])

  const filtered = useMemo(() => allRelatorios.filter(r =>
    !search || r.empresaNome.toLowerCase().includes(search.toLowerCase())
  ), [allRelatorios, search])

  const totalPaginas = Math.max(1, Math.ceil(filtered.length / ITENS_POR_PAGINA))
  const itensPagina = filtered.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  if (previewLev) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setPreviewLev(null)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <select value={modelo} onChange={(e) => setModelo(e.target.value as 'Completo' | 'Executivo')} className="h-9 px-3 rounded-lg border border-border text-sm bg-white">
              <option value="Completo">Modelo Completo</option>
              <option value="Executivo">Modelo Executivo</option>
            </select>
            <PDFDownloadLink document={<ReportDocument levantamento={previewLev} />} fileName={`relatorio-${previewLev.codigo}.pdf`} className="flex items-center gap-1 h-9 px-3 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
              {({ loading }) => <>{loading ? 'Gerando PDF...' : <><Download size={16} /> Exportar PDF</>}</>}
            </PDFDownloadLink>
          </div>
        </div>
        <ReportPreview levantamento={previewLev} modelo={modelo} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Relatórios</h1>
        <p className="text-sm text-text-secondary">{filtered.length} de {allRelatorios.length} relatório(s)</p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPagina(1); }} placeholder="Buscar por empresa..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                {['Empresa','Tipo','Data','Modelo','Status','Ações'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={6} className="py-2 px-4"><SkeletonRow /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FileText size={40} />} title="Nenhum relatório encontrado" description="Finalize um levantamento para gerar relatórios." />
      ) : (
        <>
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Empresa</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Tipo</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Data</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Modelo</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensPagina.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-text-primary">{r.empresaNome}</td>
                    <td className="py-3 px-4 text-center"><Badge variant="info">{r.tipo}</Badge></td>
                    <td className="py-3 px-4 text-center text-sm">{formatDate(r.data)}</td>
                    <td className="py-3 px-4 text-center"><Badge>{r.modelo}</Badge></td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={r.status === 'Gerado' ? 'success' : 'default'}>{r.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => {
                          const l = levantamentos.find(lv => lv.id === r.levantamentoId)
                          if (l) setPreviewLev(l)
                        }} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium">
                          <Eye size={14} /> Visualizar
                        </button>
                        {(() => {
                          const lv = levantamentos.find(lv => lv.id === r.levantamentoId)
                          if (!lv) return null
                          return (
                            <PDFDownloadLink document={<ReportDocument levantamento={lv} />} fileName={`relatorio-${lv.codigo}.pdf`} className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary font-medium">
                              {({ loading }) => <>{loading ? 'Gerando...' : <><Download size={14} /> PDF</>}</>}
                            </PDFDownloadLink>
                          )
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {itensPagina.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{r.empresaNome}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{r.tipo} — {formatDate(r.data)}</p>
                  </div>
                  <Badge variant={r.status === 'Gerado' ? 'success' : 'default'}>{r.status}</Badge>
                </div>
                <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-border">
                  <button onClick={() => {
                    const l = levantamentos.find(lv => lv.id === r.levantamentoId)
                    if (l) setPreviewLev(l)
                  }} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium">
                    <Eye size={14} /> Visualizar
                  </button>
                  {(() => {
                    const lv = levantamentos.find(lv => lv.id === r.levantamentoId)
                    if (!lv) return null
                    return (
                      <PDFDownloadLink document={<ReportDocument levantamento={lv} />} fileName={`relatorio-${lv.codigo}.pdf`} className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary font-medium">
                        {({ loading }) => <>{loading ? 'Gerando...' : <><Download size={14} /> PDF</>}</>}
                      </PDFDownloadLink>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs text-text-secondary">Página {pagina} de {totalPaginas}</span>
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {concluidos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Gerar Relatório de Levantamento</h3>
          <div className="space-y-2">
            {concluidos.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-brand-200">
                <div>
                  <p className="text-sm font-medium text-text-primary">{l.empresaNome}</p>
                  <p className="text-xs text-text-secondary">{l.codigo} — {l.tipo} — {formatDate(l.dataLevantamento)}</p>
                </div>
                <button onClick={() => gerarRelatorio(l)}
                  className="flex items-center gap-1 h-8 px-3 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600">
                  <FileText size={14} /> Gerar Relatório
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
