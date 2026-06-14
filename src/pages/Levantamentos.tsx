import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Levantamento } from '@/types'
import { useLevantamentos } from '@/hooks/useLevantamentos'
import { useApp } from '@/contexts/AppContext'
import { formatDate, generateId } from '@/lib/utils'
import { STATUS_LEVANTAMENTO, TIPOS_LEVANTAMENTO } from '@/constants'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRow, SkeletonCard } from '@/components/ui/Skeleton'
import {
  ClipboardList, Plus, Search, Edit3, Copy, Trash2, FileDown, Eye
} from 'lucide-react'

const ITENS_POR_PAGINA = 20
const statusOptions = ['Todos', STATUS_LEVANTAMENTO.RASCUNHO, STATUS_LEVANTAMENTO.EM_CAMPO, STATUS_LEVANTAMENTO.EM_REVISAO, STATUS_LEVANTAMENTO.CONCLUIDO, STATUS_LEVANTAMENTO.EXPORTADO]
const tipoOptions = ['Todos', ...TIPOS_LEVANTAMENTO]

export function Levantamentos() {
  const navigate = useNavigate()
  const { levantamentos, loading, add, remove } = useLevantamentos()
  const { toasts } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [tipoFilter, setTipoFilter] = useState('Todos')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)



  const filtered = useMemo(() => levantamentos.filter(l => {
    const matchSearch = !search || l.empresaNome.toLowerCase().includes(search.toLowerCase()) || l.codigo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Todos' || l.status === statusFilter
    const matchTipo = tipoFilter === 'Todos' || l.tipo === tipoFilter
    return matchSearch && matchStatus && matchTipo
  }), [levantamentos, search, statusFilter, tipoFilter])

  const totalPaginas = Math.max(1, Math.ceil(filtered.length / ITENS_POR_PAGINA))
  const itensPagina = filtered.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const duplicate = async (l: Levantamento) => {
    const novo: Levantamento = {
      ...l, id: generateId(), codigo: `${l.codigo}-copy`,
      status: STATUS_LEVANTAMENTO.RASCUNHO, percentual: 0, createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      assinaturaTecnico: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
      assinaturaEmpresa: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
    }
    await add(novo)
    toasts.addToast('success', 'Duplicado', 'Levantamento duplicado com sucesso.')
  }

  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!deleteId || isDeleting) return
    setIsDeleting(true)
    try {
      await remove(deleteId)
      toasts.addToast('success', 'Excluído', 'Levantamento removido com sucesso.')
    } catch (err) {
      const e = err as Record<string, unknown>
      const code = e?.code as string | undefined
      const msg = ((e?.message as string) ?? '').toLowerCase()
      if (code === '42501' || msg.includes('permission denied') || msg.includes('not authorized')) {
        toasts.addToast('error', 'Erro ao excluir', 'Você não tem permissão para excluir este levantamento.')
      } else if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network error')) {
        toasts.addToast('error', 'Erro ao excluir', 'Não foi possível excluir agora. Verifique a conexão e tente novamente.')
      } else {
        toasts.addToast('error', 'Erro ao excluir', 'Ocorreu um erro ao excluir o levantamento.')
      }
    } finally {
      setDeleteId(null)
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Levantamentos</h1>
          <p className="text-sm text-text-secondary">{filtered.length} de {levantamentos.length} registro(s)</p>
        </div>
        <button onClick={() => navigate('/levantamentos/novo')} className="flex items-center justify-center gap-2 h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors">
          <Plus size={18} /> <span>Novo Levantamento</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPagina(1); }} placeholder="Buscar por empresa, código ou setor..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagina(1); }} className="h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70">
          {statusOptions.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Status: Todos' : s}</option>)}
        </select>
        <select value={tipoFilter} onChange={(e) => { setTipoFilter(e.target.value); setPagina(1); }} className="h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70">
          {tipoOptions.map(t => <option key={t} value={t}>{t === 'Todos' ? 'Tipo: Todos' : t}</option>)}
        </select>
      </div>

      {loading ? (
        <>
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  {['Código','Empresa','Setor','Tipo','Data','Progresso','Status','Ações'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border"><td colSpan={8} className="py-2 px-4"><SkeletonRow /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList size={40} />} title="Nenhum levantamento encontrado" description="Crie um novo levantamento para começar" action={<button onClick={() => navigate('/levantamentos/novo')} className="h-9 px-4 bg-brand-500 text-white text-sm font-medium rounded-lg">Novo Levantamento</button>} />
      ) : (
        <>
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Código</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Empresa</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Setor</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Tipo</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Data</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Progresso</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensPagina.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{l.codigo}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{l.empresaNome}</p>
                      <p className="text-xs text-text-secondary">{l.cnpj}</p>
                    </td>
                    <td className="py-3 px-4 text-center"><Badge variant="info">{l.tipo}</Badge></td>
                    <td className="py-3 px-4 text-center text-sm">{formatDate(l.dataLevantamento)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${l.percentual}%` }} />
                        </div>
                        <span className="text-xs font-medium text-text-secondary">{l.percentual}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={l.status === STATUS_LEVANTAMENTO.CONCLUIDO ? 'success' : l.status === STATUS_LEVANTAMENTO.EM_ANDAMENTO ? 'info' : l.status === STATUS_LEVANTAMENTO.RASCUNHO ? 'default' : 'warning'}>{l.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => navigate(`/levantamentos/${l.id}`)} className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" title="Abrir" aria-label="Ver levantamento"><Eye size={14} /></button>
                        <button onClick={() => navigate(`/levantamentos/${l.id}`)} className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" title="Editar" aria-label="Editar levantamento"><Edit3 size={14} /></button>
                        <button onClick={() => duplicate(l)} className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" title="Duplicar" aria-label="Duplicar levantamento"><Copy size={14} /></button>
                        <button onClick={() => setDeleteId(l.id)} disabled={isDeleting} className={`p-1.5 rounded hover:bg-red-50 ${isDeleting ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-risk-high'}`} title="Excluir" aria-label="Excluir levantamento"><Trash2 size={14} /></button>
                        {l.status === STATUS_LEVANTAMENTO.CONCLUIDO && <button onClick={() => toasts.addToast('info', 'Exportar', 'Funcionalidade em desenvolvimento.')} className="p-1.5 text-text-secondary hover:text-brand-500 rounded hover:bg-green-50" title="Exportar" aria-label="Exportar levantamento"><FileDown size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {itensPagina.map((l) => (
              <div key={l.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{l.codigo}</span>
                      <Badge variant={l.tipo === TIPOS_LEVANTAMENTO[0] ? 'info' : l.tipo === TIPOS_LEVANTAMENTO[2] ? 'warning' : 'success'}>{l.tipo}</Badge>
                    </div>
                    <p className="text-sm text-text-primary font-medium mt-0.5">{l.empresaNome}</p>
                  </div>
                  <Badge variant={l.status === STATUS_LEVANTAMENTO.CONCLUIDO ? 'success' : l.status === STATUS_LEVANTAMENTO.EM_ANDAMENTO ? 'info' : 'default'}>{l.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${l.percentual}%` }} />
                  </div>
                  <span className="text-xs font-medium text-text-secondary">{l.percentual}%</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-text-secondary">{formatDate(l.dataLevantamento)} · {l.riscos.length} riscos</span>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/levantamentos/${l.id}`)} className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" aria-label="Ver levantamento"><Eye size={14} /></button>
                    <button onClick={() => navigate(`/levantamentos/${l.id}`)} className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" title="Editar" aria-label="Editar levantamento"><Edit3 size={14} /></button>
                    <button onClick={() => duplicate(l)} className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" aria-label="Duplicar levantamento"><Copy size={14} /></button>
                    <button onClick={() => setDeleteId(l.id)} disabled={isDeleting} className={`p-1.5 rounded hover:bg-red-50 ${isDeleting ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-risk-high'}`} aria-label="Excluir levantamento"><Trash2 size={14} /></button>
                  </div>
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

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Excluir Levantamento" message="Tem certeza que deseja excluir este levantamento? Todos os dados associados serão perdidos." confirmText="Excluir" variant="danger" />
    </div>
  )
}
