import { forwardRef, useImperativeHandle, useMemo, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSection, InputField } from '@/components/forms/FormSection'
import { Levantamento, CaracteristicasLocal, ItemComQuantidade } from '@/types'
import { Plus, X, Minus } from 'lucide-react'

const OPCOES_PAREDES = ['Alvenaria', 'Drywall', 'Divisória de Vidro', 'Divisória Naval', 'Madeira']
const OPCOES_PISO = ['Cerâmica', 'Porcelanato', 'Madeira', 'Cimento Queimado']
const OPCOES_FORRO = ['Gesso', 'PVC', 'Madeira', 'Cimento', 'Metal']
const OPCOES_TELHADO = ['Cerâmica', 'Fibrocimento', 'Galvanizado', 'PVC']
const OPCOES_DIVISORIAS = ['1', '2', '3', '4', '5']
const OPCOES_PAVIMENTO = ['1', '2', '3', '4']
const OPCOES_ILUMINACAO_ARTIFICIAL = ['LED', 'Fluorescente', 'Incandescente', 'Halogênio', 'Filamento']
const OPCOES_VENTILACAO_ARTIFICIAL = ['Central de Ar', 'Ar Condicionado de Janela', 'Ventilador', 'Exaustor', 'Climatizador']
const OPCOES_SISTEMA_INCENDIO = ['Extintor', 'Detector de Fumaça', 'Sprinkler', 'Sinalização de emergência']
const OPCOES_MOBILIARIOS = ['Armário Vertical', 'Hack', 'Mesa de Reunião', 'Cadeiras']
const OPCOES_EQUIPAMENTOS = ['Impressora', 'Computador', 'Notebook', 'Cafeteira']

function parseJsonList(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseItensComQuantidade(value: string): ItemComQuantidade[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const stepSchema = z.object({
  qtdColaboradores: z.string().min(1, 'Informe ao menos 1 colaborador'),
  comprimento: z.string().optional(),
  largura: z.string().optional(),
  peDireito: z.string().optional(),
  iluminacaoNatural: z.string().optional(),
  ventilacaoNatural: z.string().optional(),
  possibilidadeGES: z.string().optional(),
  epis: z.string().optional(),
  epcs: z.string().optional(),
})

type StepForm = z.infer<typeof stepSchema>

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
}

function syncCaracteristicas(updateData: Props['updateData'], data: Levantamento, partial: Partial<CaracteristicasLocal>) {
  updateData({ caracteristicas: { ...data.caracteristicas, ...partial } as CaracteristicasLocal })
}

export const Step02Caracteristicas = forwardRef<{ trigger: () => Promise<boolean> }, Props>(
  ({ data, updateData }, ref) => {
    const c = useMemo(() => data.caracteristicas || {} as CaracteristicasLocal, [data.caracteristicas])

    const { register, formState: { errors }, trigger, getValues } = useForm<StepForm>({
      resolver: zodResolver(stepSchema),
      defaultValues: {
        qtdColaboradores: String(c.qtdColaboradores || ''),
        comprimento: c.comprimento || '',
        largura: c.largura || '',
        peDireito: c.peDireito || '',
        iluminacaoNatural: c.iluminacaoNatural || '',
        ventilacaoNatural: c.ventilacaoNatural || '',
        possibilidadeGES: c.possibilidadeGES || '',
        epis: c.epis || '',
        epcs: c.epcs || '',
      },
    })

    const [sistemaIncendio, setSistemaIncendio] = useState<string[]>(() => parseJsonList(c.sistemaIncendio || '[]'))
    const [mobiliariosList, setMobiliariosList] = useState<ItemComQuantidade[]>(() => parseItensComQuantidade(c.mobiliarios || '[]'))
    const [equipamentosList, setEquipamentosList] = useState<ItemComQuantidade[]>(() => parseItensComQuantidade(c.maquinasEquipamentos || '[]'))
    const [novoMobiliario, setNovoMobiliario] = useState('')
    const [novoEquipamento, setNovoEquipamento] = useState('')

    useImperativeHandle(ref, () => ({ trigger }), [trigger])

    const syncCampos = useCallback(() => {
      const values = getValues()
      syncCaracteristicas(updateData, data, {
        ...values,
        qtdColaboradores: Number(values.qtdColaboradores) || 0,
      })
    }, [getValues, updateData, data])

    const toggleSistemaIncendio = (item: string) => {
      const nova = sistemaIncendio.includes(item)
        ? sistemaIncendio.filter(i => i !== item)
        : [...sistemaIncendio, item]
      setSistemaIncendio(nova)
      syncCaracteristicas(updateData, data, { sistemaIncendio: JSON.stringify(nova) })
    }

    const adicionarMobiliario = (nome: string) => {
      const existente = mobiliariosList.find(m => m.nome === nome)
      if (existente) {
        const nova = mobiliariosList.map(m => m.nome === nome ? { ...m, quantidade: m.quantidade + 1 } : m)
        setMobiliariosList(nova)
        syncCaracteristicas(updateData, data, { mobiliarios: JSON.stringify(nova) })
      } else {
        const nova = [...mobiliariosList, { nome, quantidade: 1 }]
        setMobiliariosList(nova)
        syncCaracteristicas(updateData, data, { mobiliarios: JSON.stringify(nova) })
      }
      setNovoMobiliario('')
    }

    const removerMobiliario = (nome: string) => {
      const nova = mobiliariosList.filter(m => m.nome !== nome)
      setMobiliariosList(nova)
      syncCaracteristicas(updateData, data, { mobiliarios: JSON.stringify(nova) })
    }

    const alterarQtdMobiliario = (nome: string, delta: number) => {
      const nova = mobiliariosList.map(m => {
        if (m.nome !== nome) return m
        const qtd = Math.max(0, m.quantidade + delta)
        return qtd === 0 ? null : { ...m, quantidade: qtd }
      }).filter(Boolean) as ItemComQuantidade[]
      setMobiliariosList(nova)
      syncCaracteristicas(updateData, data, { mobiliarios: JSON.stringify(nova) })
    }

    const adicionarEquipamento = (nome: string) => {
      const existente = equipamentosList.find(m => m.nome === nome)
      if (existente) {
        const nova = equipamentosList.map(m => m.nome === nome ? { ...m, quantidade: m.quantidade + 1 } : m)
        setEquipamentosList(nova)
        syncCaracteristicas(updateData, data, { maquinasEquipamentos: JSON.stringify(nova) })
      } else {
        const nova = [...equipamentosList, { nome, quantidade: 1 }]
        setEquipamentosList(nova)
        syncCaracteristicas(updateData, data, { maquinasEquipamentos: JSON.stringify(nova) })
      }
      setNovoEquipamento('')
    }

    const removerEquipamento = (nome: string) => {
      const nova = equipamentosList.filter(m => m.nome !== nome)
      setEquipamentosList(nova)
      syncCaracteristicas(updateData, data, { maquinasEquipamentos: JSON.stringify(nova) })
    }

    const alterarQtdEquipamento = (nome: string, delta: number) => {
      const nova = equipamentosList.map(m => {
        if (m.nome !== nome) return m
        const qtd = Math.max(0, m.quantidade + delta)
        return qtd === 0 ? null : { ...m, quantidade: qtd }
      }).filter(Boolean) as ItemComQuantidade[]
      setEquipamentosList(nova)
      syncCaracteristicas(updateData, data, { maquinasEquipamentos: JSON.stringify(nova) })
    }

    return (
      <form onChange={(e) => e.stopPropagation()}>
        <FormSection title="Características do Local" collapsible>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="Qtd. Colaboradores" required error={errors.qtdColaboradores?.message} inputId="caracteristicas-qtdColaboradores">
              <input id="caracteristicas-qtdColaboradores" type="number" {...register('qtdColaboradores')} onBlur={syncCampos}
                className="input-base" />
            </InputField>

            <InputField label="Pavimento" inputId="caracteristicas-pavimento">
              <select id="caracteristicas-pavimento" value={c.pavimento || ''} onChange={(e) => syncCaracteristicas(updateData, data, { pavimento: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_PAVIMENTO.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>

            <InputField label="Comprimento" inputId="caracteristicas-comprimento">
              <div className="flex items-center gap-2">
                <input id="caracteristicas-comprimento" {...register('comprimento')}
                  onBlur={syncCampos}
                  placeholder="0,00"
                  className="input-base flex-1" />
                <span className="text-sm font-medium text-text-secondary whitespace-nowrap">m</span>
              </div>
            </InputField>

            <InputField label="Largura" inputId="caracteristicas-largura">
              <div className="flex items-center gap-2">
                <input id="caracteristicas-largura" {...register('largura')}
                  onBlur={syncCampos}
                  placeholder="0,00"
                  className="input-base flex-1" />
                <span className="text-sm font-medium text-text-secondary whitespace-nowrap">m</span>
              </div>
            </InputField>

            <InputField label="Pé-direito" inputId="caracteristicas-peDireito">
              <div className="flex items-center gap-2">
                <input id="caracteristicas-peDireito" {...register('peDireito')}
                  onBlur={syncCampos}
                  placeholder="0,00"
                  className="input-base flex-1" />
                <span className="text-sm font-medium text-text-secondary whitespace-nowrap">m</span>
              </div>
            </InputField>

            <InputField label="Paredes/Vedação" inputId="caracteristicas-paredesVedacao">
              <select id="caracteristicas-paredesVedacao" value={c.paredesVedacao || ''} onChange={(e) => syncCaracteristicas(updateData, data, { paredesVedacao: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_PAREDES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>

            <InputField label="Divisórias" inputId="caracteristicas-divisoria">
              <select id="caracteristicas-divisoria" value={c.divisoria || ''} onChange={(e) => syncCaracteristicas(updateData, data, { divisoria: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_DIVISORIAS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>

            <InputField label="Piso" inputId="caracteristicas-piso">
              <select id="caracteristicas-piso" value={c.piso || ''} onChange={(e) => syncCaracteristicas(updateData, data, { piso: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_PISO.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>

            <InputField label="Forro" inputId="caracteristicas-forro">
              <select id="caracteristicas-forro" value={c.forro || ''} onChange={(e) => syncCaracteristicas(updateData, data, { forro: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_FORRO.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>

            <InputField label="Telhado" inputId="caracteristicas-telhado">
              <select id="caracteristicas-telhado" value={c.telhado || ''} onChange={(e) => syncCaracteristicas(updateData, data, { telhado: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_TELHADO.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>

            <InputField label="Iluminação Natural" inputId="caracteristicas-iluminacaoNatural">
              <input id="caracteristicas-iluminacaoNatural" {...register('iluminacaoNatural')} onBlur={syncCampos}
                className="input-base" />
            </InputField>

            <InputField label="Iluminação Artificial" inputId="caracteristicas-iluminacaoArtificial">
              <select id="caracteristicas-iluminacaoArtificial" value={c.iluminacaoArtificial || ''} onChange={(e) => syncCaracteristicas(updateData, data, { iluminacaoArtificial: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_ILUMINACAO_ARTIFICIAL.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>

            <InputField label="Ventilação Natural" inputId="caracteristicas-ventilacaoNatural">
              <input id="caracteristicas-ventilacaoNatural" {...register('ventilacaoNatural')} onBlur={syncCampos}
                className="input-base" />
            </InputField>

            <InputField label="Ventilação Artificial" inputId="caracteristicas-ventilacaoArtificial">
              <select id="caracteristicas-ventilacaoArtificial" value={c.ventilacaoArtificial || ''} onChange={(e) => syncCaracteristicas(updateData, data, { ventilacaoArtificial: e.target.value })}
                className="input-base">
                <option value="">Selecione...</option>
                {OPCOES_VENTILACAO_ARTIFICIAL.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </InputField>
          </div>
        </FormSection>

        <FormSection title="Segurança e Equipamentos" collapsible>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <InputField label="Sistemas de Incêndio" inputId="caracteristicas-sistemaIncendio">
                <div className="flex flex-wrap gap-2">
                  {OPCOES_SISTEMA_INCENDIO.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSistemaIncendio(item)}
                      className={`px-3 h-9 text-sm font-medium rounded-lg border transition-colors ${
                        sistemaIncendio.includes(item)
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-text-secondary border-border hover:border-brand-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {sistemaIncendio.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sistemaIncendio.map(item => (
                      <span key={item} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full border border-brand-200">
                        {item}
                        <button type="button" onClick={() => toggleSistemaIncendio(item)} className="hover:text-risk-high" aria-label={`Remover ${item}`}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </InputField>
            </div>

            <InputField label="Possibilidade de GES" inputId="caracteristicas-possibilidadeGES">
              <input id="caracteristicas-possibilidadeGES" {...register('possibilidadeGES')} onBlur={syncCampos}
                className="input-base" />
            </InputField>

            <div className="md:col-span-2">
              <InputField label="Mobiliários" inputId="caracteristicas-mobiliarios">
                <div className="flex flex-wrap gap-2 mb-3">
                  {OPCOES_MOBILIARIOS.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => adicionarMobiliario(item)}
                      className="px-3 h-9 text-sm font-medium rounded-lg border border-border bg-white text-text-secondary hover:border-brand-300 transition-colors"
                    >
                      <Plus size={14} className="inline mr-1" />{item}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={novoMobiliario}
                    onChange={(e) => setNovoMobiliario(e.target.value)}
                    placeholder="Outro mobiliário..."
                    className="input-base flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (novoMobiliario.trim()) adicionarMobiliario(novoMobiliario.trim()) } }}
                  />
                  <button type="button" onClick={() => { if (novoMobiliario.trim()) adicionarMobiliario(novoMobiliario.trim()) }} className="btn-primary h-11" aria-label="Adicionar mobiliário">
                    <Plus size={18} />
                  </button>
                </div>
                {mobiliariosList.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {mobiliariosList.map(item => (
                      <div key={item.nome} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-border">
                        <span className="text-sm font-medium text-text-primary">{item.nome}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => alterarQtdMobiliario(item.nome, -1)} className="w-7 h-7 flex items-center justify-center rounded border border-border bg-white hover:bg-gray-100 text-text-secondary" aria-label={`Diminuir quantidade de ${item.nome}`}>
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold text-text-primary min-w-[1.5rem] text-center">{item.quantidade}</span>
                          <button type="button" onClick={() => alterarQtdMobiliario(item.nome, 1)} className="w-7 h-7 flex items-center justify-center rounded border border-border bg-white hover:bg-gray-100 text-text-secondary" aria-label={`Aumentar quantidade de ${item.nome}`}>
                            <Plus size={14} />
                          </button>
                          <button type="button" onClick={() => removerMobiliario(item.nome)} className="w-7 h-7 flex items-center justify-center rounded border border-border bg-white hover:bg-red-50 text-text-secondary hover:text-risk-high ml-1" aria-label={`Remover ${item.nome}`}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </InputField>
            </div>

            <div className="md:col-span-2">
              <InputField label="Máquinas e Equipamentos" inputId="caracteristicas-maquinasEquipamentos">
                <div className="flex flex-wrap gap-2 mb-3">
                  {OPCOES_EQUIPAMENTOS.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => adicionarEquipamento(item)}
                      className="px-3 h-9 text-sm font-medium rounded-lg border border-border bg-white text-text-secondary hover:border-brand-300 transition-colors"
                    >
                      <Plus size={14} className="inline mr-1" />{item}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={novoEquipamento}
                    onChange={(e) => setNovoEquipamento(e.target.value)}
                    placeholder="Outro equipamento..."
                    className="input-base flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (novoEquipamento.trim()) adicionarEquipamento(novoEquipamento.trim()) } }}
                  />
                  <button type="button" onClick={() => { if (novoEquipamento.trim()) adicionarEquipamento(novoEquipamento.trim()) }} className="btn-primary h-11" aria-label="Adicionar equipamento">
                    <Plus size={18} />
                  </button>
                </div>
                {equipamentosList.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {equipamentosList.map(item => (
                      <div key={item.nome} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-border">
                        <span className="text-sm font-medium text-text-primary">{item.nome}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => alterarQtdEquipamento(item.nome, -1)} className="w-7 h-7 flex items-center justify-center rounded border border-border bg-white hover:bg-gray-100 text-text-secondary" aria-label={`Diminuir quantidade de ${item.nome}`}>
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold text-text-primary min-w-[1.5rem] text-center">{item.quantidade}</span>
                          <button type="button" onClick={() => alterarQtdEquipamento(item.nome, 1)} className="w-7 h-7 flex items-center justify-center rounded border border-border bg-white hover:bg-gray-100 text-text-secondary" aria-label={`Aumentar quantidade de ${item.nome}`}>
                            <Plus size={14} />
                          </button>
                          <button type="button" onClick={() => removerEquipamento(item.nome)} className="w-7 h-7 flex items-center justify-center rounded border border-border bg-white hover:bg-red-50 text-text-secondary hover:text-risk-high ml-1" aria-label={`Remover ${item.nome}`}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </InputField>
            </div>

            <InputField label="EPIs Encontrados (com CA)" inputId="caracteristicas-epis">
              <textarea id="caracteristicas-epis" {...register('epis')} onBlur={syncCampos} rows={2}
                className="input-base resize-y min-h-[2.75rem]" />
            </InputField>
            <InputField label="EPCs Encontrados" inputId="caracteristicas-epcs">
              <textarea id="caracteristicas-epcs" {...register('epcs')} onBlur={syncCampos} rows={2}
                className="input-base resize-y min-h-[2.75rem]" />
            </InputField>
          </div>
        </FormSection>

        <FormSection title="Upload de Imagens" collapsible defaultOpen={false}>
          <p className="text-sm text-text-secondary">Arraste imagens do ambiente ou clique para selecionar.</p>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mt-2">
            <p className="text-sm text-text-secondary">Funcionalidade preparada para captura de fotos em campo.</p>
          </div>
        </FormSection>
      </form>
    )
  }
)
