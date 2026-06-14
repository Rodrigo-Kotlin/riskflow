import { forwardRef, useImperativeHandle, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSection, InputField } from '@/components/forms/FormSection'
import { useEmpresas } from '@/hooks/useEmpresas'
import { Empresa, Levantamento } from '@/types'
import { Plus, X } from 'lucide-react'

const SETORES_PREDEFINIDOS = ['Administrativo', 'Comercial', 'Financeiro', 'RH']

const stepSchema = z.object({
  tipo: z.enum(['LPR', 'LPP', 'AEP'], { message: 'Selecione o tipo de levantamento' }),
  empresaId: z.string().min(1, 'Selecione a empresa/cliente'),
  setor: z.string().min(1, 'Campo obrigatório'),
  auditorTecnico: z.string().min(1, 'Campo obrigatório'),
  dataLevantamento: z.string().min(1, 'Campo obrigatório'),
  cnpj: z.string().optional(),
  responsavelEmpresa: z.string().optional(),
  empresaNome: z.string().optional(),
})

type StepForm = z.infer<typeof stepSchema>

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
  saveRascunho: () => void
  toasts: { addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void }
}

export const Step01Identificacao = forwardRef<{ trigger: () => Promise<boolean> }, Props>(
  ({ data, updateData }, ref) => {
    const { empresas } = useEmpresas()
    const [setores, setSetores] = useState<string[]>(() => {
      const saved = localStorage.getItem('riskflow_setores')
      return saved ? JSON.parse(saved) : SETORES_PREDEFINIDOS
    })
    const [novoSetor, setNovoSetor] = useState('')
    const [showNovoSetor, setShowNovoSetor] = useState(false)

    const { register, handleSubmit, formState: { errors }, trigger, setValue, getValues } = useForm<StepForm>({
      resolver: zodResolver(stepSchema),
      defaultValues: {
        tipo: data.tipo,
        empresaId: data.empresaId,
        cnpj: data.cnpj,
        setor: data.setor,
        responsavelEmpresa: data.responsavelEmpresa,
        auditorTecnico: data.auditorTecnico,
        dataLevantamento: data.dataLevantamento,
      },
    })

    useImperativeHandle(ref, () => ({ trigger }), [trigger])

    const handleEmpresaChange = useCallback(
      (empresaId: string) => {
        const empresa = empresas.find((e: Empresa) => e.id === empresaId)
        if (empresa) {
          setValue('empresaId', empresa.id)
          setValue('cnpj', empresa.cnpj)
          updateData({ empresaId: empresa.id, empresaNome: empresa.razaoSocial, cnpj: empresa.cnpj })
        }
      },
      [empresas, setValue, updateData]
    )

    const syncFormToParent = useCallback(() => {
      const values = getValues()
      updateData(values)
    }, [getValues, updateData])

    const adicionarSetor = () => {
      const nome = novoSetor.trim()
      if (!nome) return
      const normalizado = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()
      if (setores.some(s => s.toLowerCase() === normalizado.toLowerCase())) return
      const novos = [...setores, normalizado]
      setSetores(novos)
      localStorage.setItem('riskflow_setores', JSON.stringify(novos))
      setValue('setor', normalizado)
      updateData({ setor: normalizado })
      setNovoSetor('')
      setShowNovoSetor(false)
    }

    return (
      <form onSubmit={handleSubmit((v) => updateData(v))}>
        <FormSection title="Identificação do Levantamento">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Tipo do Levantamento" required error={errors.tipo?.message} inputId="tipo">
              <select id="tipo" {...register('tipo')}
                onChange={(e) => { register('tipo').onChange(e); syncFormToParent() }}
                className="input-base">
                <option value="LPR">LPR — Levantamento Preliminar de Riscos</option>
                <option value="LPP">LPP — Levantamento Preliminar de Perigos</option>
                <option value="AEP">AEP — Análise Ergonômica Preliminar</option>
              </select>
            </InputField>

            <InputField label="Empresa/Cliente" required error={errors.empresaId?.message} inputId="empresaId">
              <select id="empresaId" value={data.empresaId} onChange={(e) => handleEmpresaChange(e.target.value)}
                className="input-base">
                <option value="">Selecione...</option>
                {empresas.map((e: Empresa) => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
            </InputField>

            <InputField label="CNPJ" inputId="cnpj">
              <input id="cnpj" {...register('cnpj')} readOnly
                className="input-base bg-gray-50" />
            </InputField>

            <InputField label="Setor/Departamento" required error={errors.setor?.message} inputId="setor">
              <div className="flex gap-2">
                <select id="setor" value={data.setor} onChange={(e) => {
                  const v = e.target.value
                  if (v === '__novo__') {
                    setShowNovoSetor(true)
                  } else {
                    setValue('setor', v)
                    syncFormToParent()
                  }
                }}
                  className="input-base flex-1">
                  <option value="">Selecione...</option>
                  {setores.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__novo__">+ Adicionar novo setor</option>
                </select>
              </div>
              {showNovoSetor && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={novoSetor}
                    onChange={(e) => setNovoSetor(e.target.value)}
                    placeholder="Novo setor..."
                    className="input-base flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarSetor() } }}
                  />
                  <button type="button" onClick={adicionarSetor} className="btn-primary h-11 w-11 p-0 flex items-center justify-center" aria-label="Adicionar setor">
                    <Plus size={18} />
                  </button>
                  <button type="button" onClick={() => { setShowNovoSetor(false); setNovoSetor('') }} className="btn-secondary h-11 w-11 p-0 flex items-center justify-center" aria-label="Cancelar">
                    <X size={18} />
                  </button>
                </div>
              )}
            </InputField>

            <InputField label="Responsável da Empresa" inputId="responsavelEmpresa">
              <input id="responsavelEmpresa" {...register('responsavelEmpresa')} onBlur={syncFormToParent}
                className="input-base" />
            </InputField>

            <InputField label="Auditor Técnico Responsável" required error={errors.auditorTecnico?.message} inputId="auditorTecnico">
              <input id="auditorTecnico" {...register('auditorTecnico')} onBlur={syncFormToParent}
                className="input-base" />
            </InputField>

            <InputField label="Data do Levantamento" required error={errors.dataLevantamento?.message} inputId="dataLevantamento">
              <input id="dataLevantamento" type="date" {...register('dataLevantamento')} onBlur={syncFormToParent}
                className="input-base" />
            </InputField>
          </div>
        </FormSection>
      </form>
    )
  }
)
