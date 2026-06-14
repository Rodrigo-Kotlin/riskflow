import { useState, useEffect } from 'react'
import { BookOpen, Search, Plus, Pencil, X, AlertCircle, Hash, Tag } from 'lucide-react'
import { useApp } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { InputField } from '@/components/forms/FormSection'
import { CATEGORIAS_BIBLIOTECA } from '@/types'
import type { BibliotecaTecnicaItem, BibliotecaCategoria } from '@/types'
import {
  listarItensPorCategoria,
  buscarItensBiblioteca,
  criarItemBiblioteca,
  atualizarItemBiblioteca,
  desativarItemBiblioteca,
  reativarItemBiblioteca,
} from '@/services/biblioteca-tecnica.service'

interface ItemForm {
  nome: string
  descricao: string
  tipo: string
  grupo: string
  unidade: string
  codigo: string
  norma_referencia: string
  aplicacao: string
  observacoes: string
  tags: string
}

const emptyForm: ItemForm = {
  nome: '',
  descricao: '',
  tipo: '',
  grupo: '',
  unidade: '',
  codigo: '',
  norma_referencia: '',
  aplicacao: '',
  observacoes: '',
  tags: '',
}

export function Biblioteca() {
  const { toasts } = useApp()
  const [items, setItems] = useState<BibliotecaTecnicaItem[]>([])
  const [categoria, setCategoria] = useState<BibliotecaCategoria>('risco')
  const [search, setSearch] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BibliotecaTecnicaItem | null>(null)
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<BibliotecaTecnicaItem | null>(null)
  const [confirmReative, setConfirmReative] = useState<BibliotecaTecnicaItem | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const fetchItems = () => setFetchKey(k => k + 1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = search
          ? await buscarItensBiblioteca(categoria, search)
          : (await listarItensPorCategoria())[categoria] || []
        if (!cancelled) setItems(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca')
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [categoria, search, fetchKey])

  const handleOpenNew = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: BibliotecaTecnicaItem) => {
    setEditingItem(item)
    setForm({
      nome: item.nome,
      descricao: item.descricao || '',
      tipo: item.tipo || '',
      grupo: item.grupo || '',
      unidade: item.unidade || '',
      codigo: item.codigo || '',
      norma_referencia: item.norma_referencia || '',
      aplicacao: item.aplicacao || '',
      observacoes: item.observacoes || '',
      tags: (item.tags || []).join(', '),
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toasts.addToast('warning', 'Validação', 'O campo Nome é obrigatório.')
      return
    }
    setSaving(true)
    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      if (editingItem) {
        await atualizarItemBiblioteca(editingItem.id, {
          nome: form.nome,
          descricao: form.descricao || null,
          tipo: form.tipo || null,
          grupo: form.grupo || null,
          unidade: form.unidade || null,
          codigo: form.codigo || null,
          norma_referencia: form.norma_referencia || null,
          aplicacao: form.aplicacao || null,
          observacoes: form.observacoes || null,
          tags,
        })
        toasts.addToast('success', 'Editado', 'Item atualizado com sucesso.')
      } else {
        await criarItemBiblioteca({
          categoria,
          nome: form.nome,
          descricao: form.descricao || null,
          tipo: form.tipo || null,
          grupo: form.grupo || null,
          unidade: form.unidade || null,
          codigo: form.codigo || null,
          norma_referencia: form.norma_referencia || null,
          aplicacao: form.aplicacao || null,
          observacoes: form.observacoes || null,
          tags,
          metadados: {},
          ativo: true,
        })
        toasts.addToast('success', 'Criado', 'Novo item adicionado à biblioteca.')
      }
      setModalOpen(false)
      fetchItems()
    } catch (err) {
      toasts.addToast('error', 'Erro', err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async () => {
    if (!confirmDelete) return
    try {
      await desativarItemBiblioteca(confirmDelete.id)
      toasts.addToast('success', 'Desativado', 'Item desativado com sucesso.')
      setConfirmDelete(null)
      fetchItems()
    } catch (err) {
      toasts.addToast('error', 'Erro', err instanceof Error ? err.message : 'Erro ao desativar')
    }
  }

  const handleReative = async () => {
    if (!confirmReative) return
    try {
      await reativarItemBiblioteca(confirmReative.id)
      toasts.addToast('success', 'Reativado', 'Item reativado com sucesso.')
      setConfirmReative(null)
      fetchItems()
    } catch (err) {
      toasts.addToast('error', 'Erro', err instanceof Error ? err.message : 'Erro ao reativar')
    }
  }

  const filtered = items.filter(item =>
    !search || item.nome.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Biblioteca Técnica</h1>
          <p className="text-sm text-text-secondary">Consultar e gerenciar itens técnicos</p>
        </div>
        <button onClick={handleOpenNew} className="flex items-center gap-1.5 h-9 px-3 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 shrink-0">
          <Plus size={16} /> Novo Item
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {CATEGORIAS_BIBLIOTECA.map(cat => (
          <button key={cat.value} onClick={() => setCategoria(cat.value)}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${categoria === cat.value ? 'bg-brand-500 text-white' : 'bg-white border border-border text-text-secondary hover:bg-gray-50'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar na biblioteca..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
      </div>

      {initialLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-risk-high">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!initialLoading && !error && filtered.length === 0 && (
        <EmptyState icon={<BookOpen size={32} />}
          title="Nenhum item encontrado"
          description={search ? 'Tente alterar o termo de busca.' : 'Nesta categoria ainda não há itens. Clique em "Novo Item" para adicionar.'}
          action={!search ? <button onClick={handleOpenNew} className="h-9 px-4 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
            <Plus size={16} className="inline mr-1" />Adicionar Item
          </button> : undefined}
        />
      )}

      {!initialLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 hover:border-brand-200 transition-colors flex flex-col">
              <div className="flex items-start gap-2 mb-2">
                <Badge variant="info">{categoria === 'risco' ? 'Risco' : categoria === 'epi' ? 'EPI' : categoria === 'epc' ? 'EPC' : categoria === 'equipamento_medicao' ? 'Equip.' : item.categoria}</Badge>
                {item.is_padrao ? (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase font-semibold">Padrão</span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded uppercase font-semibold">Personalizado</span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-text-primary">{item.nome}</h4>
              {item.descricao && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.descricao}</p>}
              {(item.tipo || item.grupo) && (
                <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-text-secondary">
                  {item.tipo && <span className="flex items-center gap-1"><Hash size={10} />{item.tipo}</span>}
                  {item.grupo && <span className="flex items-center gap-1"><Tag size={10} />{item.grupo}</span>}
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-text-secondary rounded-md border border-border">{tag}</span>
                  ))}
                  {item.tags.length > 3 && <span className="text-[10px] text-text-secondary">+{item.tags.length - 3}</span>}
                </div>
              )}
              <div className="mt-auto pt-3 flex gap-2 justify-end border-t border-border">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-text-secondary hover:text-brand-500 rounded hover:bg-brand-50" title="Editar" aria-label="Editar item">
                  <Pencil size={14} />
                </button>
                {item.is_padrao ? (
                  <span className="p-1.5 text-text-disabled" title="Itens padrão não podem ser desativados"><X size={14} /></span>
                ) : (
                  <button onClick={() => setConfirmDelete(item)} className="p-1.5 text-text-secondary hover:text-risk-high rounded hover:bg-red-50" title="Desativar" aria-label="Desativar item">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Editar Item' : 'Novo Item'} size="lg">
        <div className="space-y-4">
          <InputField label="Nome" required>
            <input id="bt-nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" placeholder="Ex: Ruído contínuo" />
          </InputField>
          <InputField label="Descrição">
            <textarea id="bt-descricao" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70 resize-y" placeholder="Descrição detalhada do item" />
          </InputField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Tipo">
              <input id="bt-tipo" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" placeholder="Ex: Físico, Químico" />
            </InputField>
            <InputField label="Grupo">
              <input id="bt-grupo" value={form.grupo} onChange={e => setForm({ ...form, grupo: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" placeholder="Ex: Energia, Vibração" />
            </InputField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Código">
              <input id="bt-codigo" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" placeholder="Ex: NR-15" />
            </InputField>
            <InputField label="Unidade">
              <input id="bt-unidade" value={form.unidade} onChange={e => setForm({ ...form, unidade: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" placeholder="Ex: dB(A), lux" />
            </InputField>
          </div>
          <InputField label="Norma de Referência">
            <input id="bt-norma" value={form.norma_referencia} onChange={e => setForm({ ...form, norma_referencia: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" placeholder="Ex: NR-15, NHO-01" />
          </InputField>
          <InputField label="Aplicação">
            <textarea id="bt-aplicacao" value={form.aplicacao} onChange={e => setForm({ ...form, aplicacao: e.target.value })} className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70 resize-y" placeholder="Onde/Como este item se aplica" />
          </InputField>
          <InputField label="Observações">
            <textarea id="bt-observacoes" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70 resize-y" />
          </InputField>
          <InputField label="Tags (separadas por vírgula)">
            <input id="bt-tags" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" placeholder="Ex: ruído, contínuo, agente físico" />
          </InputField>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setModalOpen(false)} className="h-9 px-4 text-sm font-medium text-text-secondary bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-9 px-4 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50">
              {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
              {saving ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Criar Item'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDisable}
        title="Desativar item?"
        message={`O item "${confirmDelete?.nome}" será desativado e não aparecerá nas listas. É possível reativá-lo depois.`}
        confirmText="Desativar"
        variant="danger"
      />

      <ConfirmDialog
        open={!!confirmReative}
        onClose={() => setConfirmReative(null)}
        onConfirm={handleReative}
        title="Reativar item?"
        message={`O item "${confirmReative?.nome}" será reativado.`}
        confirmText="Reativar"
        variant="warning"
      />
    </div>
  )
}
