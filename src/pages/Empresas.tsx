import { useState } from 'react'
import { Empresa } from '@/types'
import { useEmpresas } from '@/hooks/useEmpresas'
import { useApp } from '@/components/layout/AppShell'
import { generateId } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton'
import {
  Building2, Plus, Search, Edit3, Trash2, MapPin, User
} from 'lucide-react'

const emptyEmpresa: Empresa = {
  id: '', razaoSocial: '', nomeFantasia: '', cnpj: '', cnae: '', grauRisco: '1',
  endereco: '', cidade: '', uf: '', responsavel: '', telefone: '', email: '',
  observacoes: '', createdAt: ''
}

export function Empresas() {
  const { empresas, loading, add, update, remove } = useEmpresas()
  const { toasts } = useApp()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Empresa>(emptyEmpresa)

  const filtered = empresas.filter(e =>
    !search || e.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    e.nomeFantasia.toLowerCase().includes(search.toLowerCase()) ||
    e.cnpj.includes(search) || e.cidade.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setForm({ ...emptyEmpresa, id: generateId(), createdAt: new Date().toISOString().split('T')[0] })
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (e: Empresa) => {
    setForm({ ...e })
    setEditingId(e.id)
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.razaoSocial || !form.cnpj) {
      toasts.addToast('error', 'Erro', 'Preencha razão social e CNPJ.')
      return
    }
    if (editingId) {
      await update(form)
      toasts.addToast('success', 'Salvo', 'Empresa atualizada com sucesso.')
    } else {
      await add(form)
      toasts.addToast('success', 'Salvo', 'Empresa cadastrada com sucesso.')
    }
    setModalOpen(false)
  }

  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!deleteId || isDeleting) return
    setIsDeleting(true)
    try {
      await remove(deleteId)
      toasts.addToast('success', 'Excluído', 'Empresa removida com sucesso.')
    } catch (err) {
      const e = err as Record<string, unknown>
      const code = e?.code as string | undefined
      const msg = ((e?.message as string) ?? '').toLowerCase()
      if (code === '42501' || msg.includes('permission denied') || msg.includes('not authorized')) {
        toasts.addToast('error', 'Erro ao excluir', 'Você não tem permissão para excluir esta empresa.')
      } else if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network error')) {
        toasts.addToast('error', 'Erro ao excluir', 'Não foi possível excluir agora. Verifique a conexão e tente novamente.')
      } else {
        toasts.addToast('error', 'Erro ao excluir', 'Ocorreu um erro ao excluir a empresa.')
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
          <h1 className="text-xl font-bold text-text-primary">Empresas</h1>
          <p className="text-sm text-text-secondary">{empresas.length} empresa(s) cadastrada(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center justify-center gap-2 h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors">
          <Plus size={18} /> <span>Cadastrar empresa</span>
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por razão social, fantasia, CNPJ ou cidade..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
      </div>

      {loading ? (
        <>
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  {['Razão Social','CNPJ','Cidade/UF','Responsável','Grau','Ações'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border"><td colSpan={6} className="py-2 px-4"><SkeletonRow /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Building2 size={40} />} title="Nenhuma empresa encontrada" description="Cadastre sua primeira empresa para começar" action={<button onClick={openNew} className="h-9 px-4 bg-brand-500 text-white text-sm font-medium rounded-lg">Cadastrar empresa</button>} />
      ) : (
        <>
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Razão Social</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">CNPJ</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Cidade/UF</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Responsável</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Grau</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-text-primary">{e.razaoSocial}</p>
                      <p className="text-xs text-text-secondary">{e.nomeFantasia}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">{e.cnpj}</td>
                    <td className="py-3 px-4 text-sm">{e.cidade}/{e.uf}</td>
                    <td className="py-3 px-4 text-sm">{e.responsavel}</td>
                    <td className="py-3 px-4"><Badge>{e.grauRisco}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" aria-label="Editar empresa"><Edit3 size={16} /></button>
                        <button onClick={() => setDeleteId(e.id)} disabled={isDeleting} className={`p-1.5 rounded-lg hover:bg-red-50 ${isDeleting ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-risk-high'}`} aria-label="Excluir empresa"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((e) => (
              <div key={e.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{e.razaoSocial}</h3>
                    <p className="text-xs text-text-secondary">{e.nomeFantasia}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(e)} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" aria-label="Editar empresa"><Edit3 size={16} /></button>
                    <button onClick={() => setDeleteId(e.id)} disabled={isDeleting} className={`p-1.5 rounded-lg hover:bg-red-50 ${isDeleting ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-risk-high'}`} aria-label="Excluir empresa"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {e.cidade}/{e.uf}</span>
                  <span><Building2 size={12} className="inline mr-1" />CNPJ: {e.cnpj}</span>
                  <span className="flex items-center gap-1"><User size={12} />{e.responsavel}</span>
                  <span className="flex items-center gap-1"><Badge>Grau {e.grauRisco}</Badge></span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Empresa' : 'Cadastrar Empresa'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2"><label className="text-xs font-medium">Razão Social *</label><input value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">Nome Fantasia</label><input value={form.nomeFantasia} onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">CNPJ *</label><input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">CNAE</label><input value={form.cnae} onChange={(e) => setForm({ ...form, cnae: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">Grau de Risco</label><select value={form.grauRisco} onChange={(e) => setForm({ ...form, grauRisco: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70 bg-white"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></div>
          <div className="space-y-1 md:col-span-2"><label className="text-xs font-medium">Endereço</label><input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">Cidade</label><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">UF</label><select value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70 bg-white"><option value="">Selecione</option><option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option><option value="MA">MA</option><option value="MG">MG</option><option value="MS">MS</option><option value="MT">MT</option><option value="PA">PA</option><option value="PB">PB</option><option value="PE">PE</option><option value="PI">PI</option><option value="PR">PR</option><option value="RJ">RJ</option><option value="RN">RN</option><option value="RO">RO</option><option value="RR">RR</option><option value="RS">RS</option><option value="SC">SC</option><option value="SE">SE</option><option value="SP">SP</option><option value="TO">TO</option></select></div>
          <div className="space-y-1"><label className="text-xs font-medium">Responsável</label><input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">Telefone</label><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1"><label className="text-xs font-medium">E-mail</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
          <div className="space-y-1 md:col-span-2"><label className="text-xs font-medium">Observações</label><textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={() => setModalOpen(false)} className="px-4 h-9 text-sm font-medium text-text-secondary hover:text-text-primary bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
          <button onClick={save} className="px-4 h-9 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">Salvar</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Excluir empresa" message="Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita." confirmText="Excluir" variant="danger" />
    </div>
  )
}
