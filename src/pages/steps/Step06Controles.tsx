import { useState, useEffect } from 'react'
import { Controle, Levantamento } from '@/types'
import type { BibliotecaTecnicaItem } from '@/types'
import { generateId } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { InputField } from '@/components/forms/FormSection'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { buscarItensBiblioteca } from '@/services/biblioteca-tecnica.service'
import { Plus, Edit3, Trash2, ClipboardList, BookOpen } from 'lucide-react'
import { TIPOS_CONTROLE, STATUS_CONTROLE, PRIORIDADE_CONTROLE } from '@/constants'

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
}

function emptyControle(): Controle {
  return {
    id: generateId(), riscoId: '', acao: '', origem: '', tipo: TIPOS_CONTROLE[0],
    responsavel: '', prazo: '', prioridade: PRIORIDADE_CONTROLE.MEDIA, status: STATUS_CONTROLE.PENDENTE,
    custoEstimado: '', observacoes: ''
  }
}

export function Step06Controles({ data, updateData }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Controle>(emptyControle())
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [libraryItems, setLibraryItems] = useState<BibliotecaTecnicaItem[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLibraryLoading(true)
      try {
        const items = await buscarItensBiblioteca('medida_controle')
        if (!cancelled) setLibraryItems(items)
      } catch {
        // fallback silencioso
      } finally {
        if (!cancelled) setLibraryLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const controles: Controle[] = data.controles || []
  const riscos = data.riscos || []

  const gerarControles = () => {
    const novos = riscos.filter((r) => !controles.some((c: Controle) => c.riscoId === r.id)).flatMap((r) => {
      const items: Controle[] = []
      const prefix = r.perigo
      if (r.controleFonte) items.push({ id: generateId(), riscoId: r.id, acao: r.controleFonte, origem: prefix, tipo: TIPOS_CONTROLE[0], responsavel: '', prazo: '', prioridade: PRIORIDADE_CONTROLE.MEDIA, status: STATUS_CONTROLE.PENDENTE, custoEstimado: '', observacoes: '' })
      if (r.controleTrajetoria) items.push({ id: generateId(), riscoId: r.id, acao: r.controleTrajetoria, origem: prefix, tipo: TIPOS_CONTROLE[1], responsavel: '', prazo: '', prioridade: PRIORIDADE_CONTROLE.MEDIA, status: STATUS_CONTROLE.PENDENTE, custoEstimado: '', observacoes: '' })
      if (r.controleTrabalhador) items.push({ id: generateId(), riscoId: r.id, acao: r.controleTrabalhador, origem: prefix, tipo: TIPOS_CONTROLE[2], responsavel: '', prazo: '', prioridade: PRIORIDADE_CONTROLE.MEDIA, status: STATUS_CONTROLE.PENDENTE, custoEstimado: '', observacoes: '' })
      return items
    })
    if (novos.length > 0) {
      updateData({ controles: [...controles, ...novos] })
    }
  }

  const filtered = statusFilter === 'Todos' ? controles : controles.filter(c => c.status === statusFilter)

  const openNew = () => {
    setForm(emptyControle())
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (c: Controle) => {
    setForm({ ...c })
    setEditingId(c.id)
    setModalOpen(true)
  }

  const save = () => {
    const errors: Record<string, string> = {}
    if (!form.acao.trim()) errors.acao = 'O campo Ação Recomendada é obrigatório.'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return
    if (editingId) {
      updateData({ controles: controles.map((c: Controle) => c.id === editingId ? form : c) })
    } else {
      updateData({ controles: [...controles, form] })
    }
    setFormErrors({})
    setModalOpen(false)
  }

  const remove = (id: string) => {
    updateData({ controles: controles.filter((c: Controle) => c.id !== id) })
  }

  const statusColors: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
    [STATUS_CONTROLE.PENDENTE]: 'warning',
    [STATUS_CONTROLE.EM_ANDAMENTO]: 'info',
    [STATUS_CONTROLE.CONCLUIDO]: 'success',
    [STATUS_CONTROLE.NAO_INICIADO]: 'default',
  }

  const prioridadeColors: Record<string, 'danger' | 'warning' | 'success' | 'default'> = {
    [PRIORIDADE_CONTROLE.CRITICA]: 'danger',
    [PRIORIDADE_CONTROLE.ALTA]: 'danger',
    [PRIORIDADE_CONTROLE.MEDIA]: 'warning',
    [PRIORIDADE_CONTROLE.BAIXA]: 'success',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Controles e Plano de Ação ({controles.length})</h3>
          <p className="text-xs text-text-secondary">Consolidado dos controles recomendados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={gerarControles} className="flex items-center gap-1 h-8 px-3 border border-brand-500 text-brand-500 text-xs font-medium rounded-lg hover:bg-brand-50">
            <ClipboardList size={14} /> Consolidar dos Riscos
          </button>
          <button onClick={openNew} className="flex items-center gap-1 h-8 px-3 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600">
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Todos', STATUS_CONTROLE.PENDENTE, STATUS_CONTROLE.EM_ANDAMENTO, STATUS_CONTROLE.CONCLUIDO, STATUS_CONTROLE.NAO_INICIADO].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? 'bg-brand-500 text-white border-brand-500' : 'text-text-secondary border-border hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList size={32} />} title="Nenhum controle cadastrado" description="Consolide os controles dos riscos ou cadastre manualmente." />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-xs font-medium text-text-secondary">Ação</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-text-secondary">Origem</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Tipo</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Prioridade</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Status</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: Controle) => (
                  <tr key={c.id} className="border-b border-border hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <p className="font-medium text-text-primary">{c.acao}</p>
                      <p className="text-xs text-text-secondary">Resp: {c.responsavel || '-'} · Prazo: {c.prazo || '-'}</p>
                    </td>
                    <td className="py-2 px-2 text-sm">{c.origem}</td>
                    <td className="py-2 px-2 text-center"><Badge variant="info">{c.tipo}</Badge></td>
                    <td className="py-2 px-2 text-center"><Badge variant={prioridadeColors[c.prioridade]}>{c.prioridade}</Badge></td>
                    <td className="py-2 px-2 text-center"><Badge variant={statusColors[c.status]}>{c.status}</Badge></td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-1 text-text-secondary hover:text-text-primary rounded" aria-label="Editar controle"><Edit3 size={14} /></button>
                        <button onClick={() => remove(c.id)} className="p-1 text-text-secondary hover:text-risk-high rounded" aria-label="Excluir controle"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {filtered.map((c: Controle) => (
              <div key={c.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{c.acao}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{c.origem}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(c)} className="p-1 text-text-secondary" aria-label="Editar controle"><Edit3 size={14} /></button>
                    <button onClick={() => remove(c.id)} className="p-1 text-text-secondary" aria-label="Excluir controle"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={statusColors[c.status]}>{c.status}</Badge>
                  <Badge variant={prioridadeColors[c.prioridade]}>{c.prioridade}</Badge>
                  <span className="text-xs text-text-secondary">{c.tipo}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Controle' : 'Novo Controle'}>
        {!editingId && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-text-secondary" />
              <p className="text-xs font-medium text-text-secondary">
                {libraryLoading ? 'Carregando medidas da biblioteca...' : 'Sugestões da biblioteca técnica:'}
              </p>
            </div>
            {libraryLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : libraryItems.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {libraryItems.map(item => (
                  <button key={item.id} type="button" onClick={() => setForm({ ...emptyControle(), acao: item.nome, tipo: TIPOS_CONTROLE[0] })}
                    className="shrink-0 text-left p-2 border border-border rounded-lg hover:border-brand-500 hover:bg-brand-50 text-xs max-w-[200px]">
                    <span className="font-medium text-text-primary block truncate">{item.nome}</span>
                    {item.descricao && <span className="text-text-secondary block truncate">{item.descricao}</span>}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField label="Ação Recomendada" required error={formErrors.acao} className="md:col-span-2" inputId="controle-acao">
            <textarea id="controle-acao" value={form.acao} onChange={(e) => { setForm({ ...form, acao: e.target.value }); if (formErrors.acao) setFormErrors({}) }} rows={2} className={`w-full px-3 py-2 rounded-lg border text-sm ${formErrors.acao ? 'border-risk-high focus:ring-risk-high/50' : 'border-border'}`} />
          </InputField>
          <InputField label="Origem do Risco" inputId="controle-origem"><input id="controle-origem" value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Tipo de Controle" inputId="controle-tipo">
            <select id="controle-tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Controle['tipo'] })} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-white">
              {TIPOS_CONTROLE.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </InputField>
          <InputField label="Responsável" inputId="controle-responsavel"><input id="controle-responsavel" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Prazo" inputId="controle-prazo"><input id="controle-prazo" type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Prioridade" inputId="controle-prioridade">
            <select id="controle-prioridade" value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value as Controle['prioridade'] })} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-white">
              <option value={PRIORIDADE_CONTROLE.BAIXA}>{PRIORIDADE_CONTROLE.BAIXA}</option>
              <option value={PRIORIDADE_CONTROLE.MEDIA}>{PRIORIDADE_CONTROLE.MEDIA}</option>
              <option value={PRIORIDADE_CONTROLE.ALTA}>{PRIORIDADE_CONTROLE.ALTA}</option>
              <option value={PRIORIDADE_CONTROLE.CRITICA}>{PRIORIDADE_CONTROLE.CRITICA}</option>
            </select>
          </InputField>
          <InputField label="Status" inputId="controle-status">
            <select id="controle-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Controle['status'] })} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-white">
              <option value={STATUS_CONTROLE.NAO_INICIADO}>{STATUS_CONTROLE.NAO_INICIADO}</option>
              <option value={STATUS_CONTROLE.PENDENTE}>{STATUS_CONTROLE.PENDENTE}</option>
              <option value={STATUS_CONTROLE.EM_ANDAMENTO}>{STATUS_CONTROLE.EM_ANDAMENTO}</option>
              <option value={STATUS_CONTROLE.CONCLUIDO}>{STATUS_CONTROLE.CONCLUIDO}</option>
            </select>
          </InputField>
          <InputField label="Custo Estimado" inputId="controle-custoEstimado"><input id="controle-custoEstimado" value={form.custoEstimado} onChange={(e) => setForm({ ...form, custoEstimado: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Observações" className="md:col-span-2" inputId="controle-observacoes">
            <textarea id="controle-observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
        </div>
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-border">
          <button onClick={() => setModalOpen(false)} className="px-3 h-8 text-sm text-text-secondary bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={save} className="px-3 h-8 bg-brand-500 text-white text-sm font-medium rounded-lg">Salvar</button>
        </div>
      </Modal>
    </div>
  )
}
