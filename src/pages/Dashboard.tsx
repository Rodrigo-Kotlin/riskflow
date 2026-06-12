import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonStatCard, SkeletonCard } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { useLevantamentos } from '@/hooks/useLevantamentos'
import type { Levantamento } from '@/types'
import { formatDate } from '@/lib/utils'
import { STATUS_LEVANTAMENTO, NIVEIS_RISCO } from '@/constants'
import {
  ClipboardList, CheckCircle2, FileSearch, AlertTriangle, Building2, FileText,
  Plus, Search, ArrowRight, BarChart3
} from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const { levantamentos, loading } = useLevantamentos()
  const [search, setSearch] = useState('')

  const total = useMemo(() => levantamentos.length, [levantamentos])
  const concluidos = useMemo(() => levantamentos.filter(l => l.status === STATUS_LEVANTAMENTO.CONCLUIDO).length, [levantamentos])
  const emAndamento = useMemo(() => levantamentos.filter(l => l.status === STATUS_LEVANTAMENTO.EM_ANDAMENTO).length, [levantamentos])
  const emRevisao = useMemo(() => levantamentos.filter(l => l.status === STATUS_LEVANTAMENTO.EM_REVISAO).length, [levantamentos])
  const riscosCriticos = useMemo(() => levantamentos.reduce((acc, l) => acc + l.riscos.filter(r => r.nivel === NIVEIS_RISCO.CRITICO).length, 0), [levantamentos])
  const totalEmpresas = useMemo(() => [...new Set(levantamentos.map(l => l.empresaId))].length, [levantamentos])

  const recentes = useMemo(() => {
    let list = [...levantamentos]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(l => l.empresaNome.toLowerCase().includes(q) || l.codigo.toLowerCase().includes(q))
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  }, [levantamentos, search])

  const categoriasAgrupadas = useMemo(() => agruparRiscos(levantamentos), [levantamentos])
  const maxRiscosValor = useMemo(() => Math.max(...categoriasAgrupadas.map(([_, v]) => v), 1), [categoriasAgrupadas])

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary">Visão geral dos levantamentos</p>
        </div>
        <button
          onClick={() => navigate('/levantamentos/novo')}
          className="flex items-center justify-center gap-2 h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Novo Levantamento</span>
        </button>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="space-y-3">
              <SkeletonCard />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard icon={ClipboardList} label="Em andamento" value={emAndamento} variant="info" onClick={() => navigate('/levantamentos')} />
            <StatCard icon={CheckCircle2} label="Concluídos" value={concluidos} variant="success" onClick={() => navigate('/levantamentos')} />
            <StatCard icon={FileSearch} label="Em revisão" value={emRevisao} variant="warning" onClick={() => navigate('/levantamentos')} />
            <StatCard icon={AlertTriangle} label="Riscos críticos" value={riscosCriticos} variant="danger" onClick={() => navigate('/levantamentos')} />
            <StatCard icon={Building2} label="Empresas" value={totalEmpresas} variant="default" onClick={() => navigate('/empresas')} />
            <StatCard icon={FileText} label="Relatórios" value={concluidos} variant="info" onClick={() => navigate('/relatorios')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-text-primary">Últimos Levantamentos</h2>
                  <button onClick={() => navigate('/levantamentos')} className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
                    Ver todos <ArrowRight size={14} />
                  </button>
                </div>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por empresa ou código..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70"
                  />
                </div>
                {recentes.length === 0 ? (
                  <EmptyState icon={<ClipboardList size={32} />} title="Nenhum levantamento encontrado" description="Crie um novo levantamento para começar" />
                ) : (
                  <div className="space-y-2">
                    {recentes.map((l) => (
                      <div key={l.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-border transition-all cursor-pointer" onClick={() => navigate(`/levantamentos/${l.id}`)}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{l.codigo}</span>
                            <Badge variant={l.status === STATUS_LEVANTAMENTO.CONCLUIDO ? 'success' : l.status === STATUS_LEVANTAMENTO.EM_ANDAMENTO ? 'info' : l.status === STATUS_LEVANTAMENTO.RASCUNHO ? 'default' : 'warning'}>{l.status}</Badge>
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-0.5">{l.empresaNome} — {l.setor}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xs text-text-secondary">{formatDate(l.dataLevantamento)}</p>
                          <div className="flex items-center gap-1 mt-0.5 justify-end">
                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-medium">{l.percentual}%</span>
                            <span className="text-[10px] text-text-secondary">{l.riscos.length} riscos</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-brand-500" /> Riscos por Categoria
                </h2>
                {levantamentos.length === 0 ? (
                  <EmptyState icon={<BarChart3 size={24} />} title="Sem dados" />
                ) : (
                  <div className="space-y-2">
                    {categoriasAgrupadas.slice(0, 8).map(([cat, qtd]) => (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-text-secondary truncate">{cat}</span>
                          <span className="font-medium text-text-primary">{qtd}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (qtd / maxRiscosValor) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function agruparRiscos(levantamentos: Levantamento[]): [string, number][] {
  const map = new Map<string, number>()
  levantamentos.forEach(l => l.riscos.forEach(r => {
    map.set(r.categoria, (map.get(r.categoria) || 0) + 1)
  }))
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}


