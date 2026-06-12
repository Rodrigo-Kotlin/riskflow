import { useState } from 'react'
import { Medicao, Levantamento } from '@/types'
import { generateId } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { InputField } from '@/components/forms/FormSection'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Edit3, Trash2, Copy, Ruler } from 'lucide-react'

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
}

const emptyMedicao: Medicao = {
  id: '', postoLocal: '', ruidoDbA: 0, tempoExposicao: '', iluminanciaLux: 0,
  temperatura: 0, umidade: 0, velocidadeAr: 0, radiacao: '', equipamento: '',
  dataHora: '', foto: '', observacoes: ''
}

export function Step03Medicoes({ data, updateData }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Medicao>(emptyMedicao)

  const medicoes = data.medicoes || []

  const openNew = () => {
    setForm({ ...emptyMedicao, id: generateId() })
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (m: Medicao) => {
    setForm({ ...m })
    setEditingId(m.id)
    setModalOpen(true)
  }

  const save = () => {
    if (!form.postoLocal) return
    if (editingId) {
      updateData({ medicoes: medicoes.map((m: Medicao) => m.id === editingId ? form : m) })
    } else {
      updateData({ medicoes: [...medicoes, form] })
    }
    setModalOpen(false)
  }

  const remove = (id: string) => {
    updateData({ medicoes: medicoes.filter((m: Medicao) => m.id !== id) })
  }

  const duplicate = (m: Medicao) => {
    updateData({ medicoes: [...medicoes, { ...m, id: generateId() }] })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Medições Pontuais ({medicoes.length})</h3>
        <button onClick={openNew} className="flex items-center gap-1 h-8 px-3 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600">
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {medicoes.length === 0 ? (
        <EmptyState icon={<Ruler size={32} />} title="Nenhuma medição registrada" description="Adicione medições pontuais do ambiente avaliado." action={<button onClick={openNew} className="h-8 px-3 bg-brand-500 text-white text-xs font-medium rounded-lg">Adicionar Medição</button>} />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-xs font-medium text-text-secondary">Posto/Local</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Ruído dB(A)</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Lux</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Temp.</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Umidade</th>
                  <th className="text-center py-2 px-2 text-xs font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {medicoes.map((m: Medicao) => (
                  <tr key={m.id} className="border-b border-border">
                    <td className="py-2 px-2 font-medium">{m.postoLocal}</td>
                    <td className="py-2 px-2 text-center">{m.ruidoDbA}</td>
                    <td className="py-2 px-2 text-center">{m.iluminanciaLux}</td>
                    <td className="py-2 px-2 text-center">{m.temperatura}°C</td>
                    <td className="py-2 px-2 text-center">{m.umidade}%</td>
                    <td className="py-2 px-2">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(m)} className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" aria-label="Editar medição"><Edit3 size={14} /></button>
                        <button onClick={() => duplicate(m)} className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" aria-label="Duplicar medição"><Copy size={14} /></button>
                        <button onClick={() => remove(m.id)} className="p-1 text-text-secondary hover:text-risk-high rounded hover:bg-red-50" aria-label="Excluir medição"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {medicoes.map((m: Medicao) => (
              <div key={m.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">{m.postoLocal}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="p-1 text-text-secondary hover:text-text-primary rounded" aria-label="Editar medição"><Edit3 size={14} /></button>
                    <button onClick={() => remove(m.id)} className="p-1 text-text-secondary hover:text-risk-high rounded" aria-label="Excluir medição"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-text-secondary">
                  <span>Ruído: {m.ruidoDbA} dB(A)</span>
                  <span>Lux: {m.iluminanciaLux}</span>
                  <span>Temp: {m.temperatura}°C</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Medição' : 'Nova Medição'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField label="Posto/Local Avaliado" required className="md:col-span-2" inputId="medicao-postoLocal">
            <input id="medicao-postoLocal" value={form.postoLocal} onChange={(e) => setForm({ ...form, postoLocal: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Ruído dB(A)" inputId="medicao-ruidoDbA"><input id="medicao-ruidoDbA" type="number" value={form.ruidoDbA} onChange={(e) => setForm({ ...form, ruidoDbA: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Tempo de Exposição" inputId="medicao-tempoExposicao"><input id="medicao-tempoExposicao" value={form.tempoExposicao} onChange={(e) => setForm({ ...form, tempoExposicao: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Iluminância (lux)" inputId="medicao-iluminanciaLux"><input id="medicao-iluminanciaLux" type="number" value={form.iluminanciaLux} onChange={(e) => setForm({ ...form, iluminanciaLux: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Temperatura (°C)" inputId="medicao-temperatura"><input id="medicao-temperatura" type="number" value={form.temperatura} onChange={(e) => setForm({ ...form, temperatura: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Umidade (%)" inputId="medicao-umidade"><input id="medicao-umidade" type="number" value={form.umidade} onChange={(e) => setForm({ ...form, umidade: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Velocidade do Ar (m/s)" inputId="medicao-velocidadeAr"><input id="medicao-velocidadeAr" type="number" value={form.velocidadeAr} onChange={(e) => setForm({ ...form, velocidadeAr: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Radiação" inputId="medicao-radiacao"><input id="medicao-radiacao" value={form.radiacao} onChange={(e) => setForm({ ...form, radiacao: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Equipamento" inputId="medicao-equipamento"><input id="medicao-equipamento" value={form.equipamento} onChange={(e) => setForm({ ...form, equipamento: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Data/Hora" inputId="medicao-dataHora"><input id="medicao-dataHora" type="datetime-local" value={form.dataHora} onChange={(e) => setForm({ ...form, dataHora: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" /></InputField>
          <InputField label="Observações" className="md:col-span-2" inputId="medicao-observacoes">
            <textarea id="medicao-observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
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
