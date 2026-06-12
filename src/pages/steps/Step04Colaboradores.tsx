import { useState } from 'react'
import { Colaborador, Levantamento } from '@/types'
import { generateId } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { InputField } from '@/components/forms/FormSection'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit3, Trash2, QrCode, Users } from 'lucide-react'
import { STATUS_COLETA } from '@/constants'

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
}

const emptyColab: Colaborador = {
  id: '', nome: '', cargo: '', setor: '', posto: '',
  descricaoAtividades: '', observacoes: '', statusColeta: STATUS_COLETA.PENDENTE, qrCodeLink: ''
}

export function Step04Colaboradores({ data, updateData }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Colaborador>(emptyColab)

  const colaboradores = data.colaboradores || []

  const openNew = () => {
    setForm({ ...emptyColab, id: generateId(), qrCodeLink: `https://coleta.riskflow.io/${data.id}-${generateId().slice(0, 6)}` })
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (c: Colaborador) => {
    setForm({ ...c })
    setEditingId(c.id)
    setModalOpen(true)
  }

  const save = () => {
    if (!form.nome) return
    if (editingId) {
      updateData({ colaboradores: colaboradores.map((c: Colaborador) => c.id === editingId ? form : c) })
    } else {
      updateData({ colaboradores: [...colaboradores, form] })
    }
    setModalOpen(false)
  }

  const remove = (id: string) => {
    updateData({ colaboradores: colaboradores.filter((c: Colaborador) => c.id !== id) })
  }

  const statusVariant: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
    [STATUS_COLETA.PENDENTE]: 'warning',
    [STATUS_COLETA.ENVIADO]: 'info',
    [STATUS_COLETA.RESPONDIDO]: 'success',
    [STATUS_COLETA.VALIDADO]: 'success',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Colaboradores e Atividades ({colaboradores.length})</h3>
        <div className="flex gap-2">
          <button onClick={() => setQrModalOpen(true)} className="flex items-center gap-1 h-8 px-3 border border-border text-text-secondary text-xs font-medium rounded-lg hover:bg-gray-50">
            <QrCode size={14} /> QR Code
          </button>
          <button onClick={openNew} className="flex items-center gap-1 h-8 px-3 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600">
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      {colaboradores.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="Nenhum colaborador cadastrado" description="Adicione os colaboradores e suas atividades." action={<button onClick={openNew} className="h-8 px-3 bg-brand-500 text-white text-xs font-medium rounded-lg">Adicionar Colaborador</button>} />
      ) : (
        <div className="space-y-2">
          {colaboradores.map((c: Colaborador) => (
            <div key={c.id} className="flex items-start justify-between p-3 border border-border rounded-lg hover:border-brand-200 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{c.nome}</span>
                  <Badge variant={statusVariant[c.statusColeta] || 'default'}>{c.statusColeta}</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{c.cargo} — {c.setor}</p>
                {c.descricaoAtividades && <p className="text-xs text-text-secondary mt-1 line-clamp-1">{c.descricaoAtividades}</p>}
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <button onClick={() => openEdit(c)} className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" aria-label="Editar colaborador"><Edit3 size={14} /></button>
                <button onClick={() => remove(c.id)} className="p-1.5 text-text-secondary hover:text-risk-high rounded hover:bg-red-50" aria-label="Excluir colaborador"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Colaborador' : 'Novo Colaborador'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField label="Nome do Colaborador" required className="md:col-span-2" inputId="colaborador-nome">
            <input id="colaborador-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Cargo/Função" inputId="colaborador-cargo"><input id="colaborador-cargo" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Setor" inputId="colaborador-setor"><input id="colaborador-setor" value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Posto de Trabalho" inputId="colaborador-posto"><input id="colaborador-posto" value={form.posto} onChange={(e) => setForm({ ...form, posto: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Status da Coleta" inputId="colaborador-statusColeta">
            <select id="colaborador-statusColeta" value={form.statusColeta} onChange={(e) => setForm({ ...form, statusColeta: e.target.value as any })} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-white">
              <option value={STATUS_COLETA.PENDENTE}>{STATUS_COLETA.PENDENTE}</option>
              <option value={STATUS_COLETA.ENVIADO}>{STATUS_COLETA.ENVIADO}</option>
              <option value={STATUS_COLETA.RESPONDIDO}>{STATUS_COLETA.RESPONDIDO}</option>
              <option value={STATUS_COLETA.VALIDADO}>{STATUS_COLETA.VALIDADO}</option>
            </select>
          </InputField>
          <InputField label="Descrição das Atividades" className="md:col-span-2" inputId="colaborador-descricaoAtividades">
            <textarea id="colaborador-descricaoAtividades" value={form.descricaoAtividades} onChange={(e) => setForm({ ...form, descricaoAtividades: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Observações" className="md:col-span-2" inputId="colaborador-observacoes">
            <textarea id="colaborador-observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
        </div>
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-border">
          <button onClick={() => setModalOpen(false)} className="px-3 h-8 text-sm text-text-secondary bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={save} className="px-3 h-8 bg-brand-500 text-white text-sm font-medium rounded-lg">Salvar</button>
        </div>
      </Modal>

      <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)} title="QR Code de Coleta" size="sm">
        <div className="text-center py-4">
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4 border-2 border-dashed border-border">
            <QrCode size={64} className="text-text-secondary" />
          </div>
          <p className="text-sm font-medium text-text-primary">Link de Coleta</p>
          <p className="text-xs text-text-secondary mt-1 break-all">https://coleta.riskflow.io/{data.id}</p>
          <p className="text-xs text-text-secondary mt-3 italic">Funcionalidade preparada para integração futura com envio de formulários de coleta.</p>
          <button onClick={() => {
            navigator.clipboard?.writeText(`https://coleta.riskflow.io/${data.id}`)
          }} className="mt-3 px-4 h-8 bg-brand-500 text-white text-xs font-medium rounded-lg">Copiar Link</button>
        </div>
      </Modal>
    </div>
  )
}
