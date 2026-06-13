import { forwardRef, useImperativeHandle, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSection, InputField } from '@/components/forms/FormSection'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Empresa, Levantamento } from '@/types'
import { empresasMock } from '@/data/mock'

const stepSchema = z.object({
  tipo: z.enum(['LPR', 'LPP', 'AEP'], { message: 'Selecione o tipo de levantamento' }),
  empresaId: z.string().min(1, 'Selecione a empresa/cliente'),
  unidade: z.string().min(1, 'Campo obrigatório'),
  setor: z.string().min(1, 'Campo obrigatório'),
  auditorTecnico: z.string().min(1, 'Campo obrigatório'),
  dataLevantamento: z.string().min(1, 'Campo obrigatório'),
  cnpj: z.string().optional(),
  responsavelEmpresa: z.string().optional(),
  registroMTE: z.string().optional(),
  dataLancamentoSGG: z.string().optional(),
  responsavelLancamento: z.string().optional(),
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
    const [empresas] = useLocalStorage<Empresa[]>('riskflow_empresas', empresasMock)

    const { register, handleSubmit, formState: { errors }, trigger, setValue, watch } = useForm<StepForm>({
      resolver: zodResolver(stepSchema),
      defaultValues: {
        tipo: data.tipo,
        empresaId: data.empresaId,
        cnpj: data.cnpj,
        unidade: data.unidade,
        setor: data.setor,
        responsavelEmpresa: data.responsavelEmpresa,
        auditorTecnico: data.auditorTecnico,
        registroMTE: data.registroMTE,
        dataLevantamento: data.dataLevantamento,
        dataLancamentoSGG: data.dataLancamentoSGG,
        responsavelLancamento: data.responsavelLancamento,
      },
    })

    useImperativeHandle(ref, () => ({ trigger }), [trigger])

    useEffect(() => {
      const sub = watch((values) => {
        updateData(values)
      })
      return () => sub.unsubscribe()
    }, [watch, updateData])

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

    return (
      <form onSubmit={handleSubmit((v) => updateData(v))}>
        <FormSection title="Identificação do Levantamento">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Tipo do Levantamento" required error={errors.tipo?.message} inputId="tipo">
              <select id="tipo" {...register('tipo')} onChange={(e) => { register('tipo').onChange(e); updateData({ tipo: e.target.value as Levantamento['tipo'] }) }}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70">
                <option value="LPR">LPR — Levantamento Preliminar de Riscos</option>
                <option value="LPP">LPP — Levantamento Preliminar de Perigos</option>
                <option value="AEP">AEP — Análise Ergonômica Preliminar</option>
              </select>
            </InputField>

            <InputField label="Empresa/Cliente" required error={errors.empresaId?.message} inputId="empresaId">
              <select id="empresaId" value={data.empresaId} onChange={(e) => handleEmpresaChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70">
                <option value="">Selecione...</option>
                {empresas.map((e: Empresa) => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
            </InputField>

            <InputField label="CNPJ" inputId="cnpj">
              <input id="cnpj" {...register('cnpj')} readOnly
                className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Unidade Operacional" required error={errors.unidade?.message} inputId="unidade">
              <input id="unidade" {...register('unidade')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Setor/Departamento" required error={errors.setor?.message} inputId="setor">
              <input id="setor" {...register('setor')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Responsável da Empresa" inputId="responsavelEmpresa">
              <input id="responsavelEmpresa" {...register('responsavelEmpresa')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Auditor Técnico Responsável" required error={errors.auditorTecnico?.message} inputId="auditorTecnico">
              <input id="auditorTecnico" {...register('auditorTecnico')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Registro Profissional/MTE" inputId="registroMTE">
              <input id="registroMTE" {...register('registroMTE')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Data do Levantamento" required error={errors.dataLevantamento?.message} inputId="dataLevantamento">
              <input id="dataLevantamento" type="date" {...register('dataLevantamento')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Data de Lançamento no SGG" inputId="dataLancamentoSGG">
              <input id="dataLancamentoSGG" type="date" {...register('dataLancamentoSGG')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Responsável pelo Lançamento" inputId="responsavelLancamento">
              <input id="responsavelLancamento" {...register('responsavelLancamento')}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>

            <InputField label="Status do Levantamento" inputId="status">
              <input id="status" value={data.status}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-gray-50" readOnly />
            </InputField>
          </div>
        </FormSection>
      </form>
    )
  }
)
