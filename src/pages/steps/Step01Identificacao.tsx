import { forwardRef, useImperativeHandle, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSection, InputField } from '@/components/forms/FormSection'
import { useEmpresas } from '@/hooks/useEmpresas'
import { Empresa, Levantamento } from '@/types'

const stepSchema = z.object({
  tipo: z.enum(['LPR', 'LPP', 'AEP'], { message: 'Selecione o tipo de levantamento' }),
  empresaId: z.string().min(1, 'Selecione a empresa/cliente'),
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

    const { register, handleSubmit, formState: { errors }, trigger, setValue, getValues } = useForm<StepForm>({
      resolver: zodResolver(stepSchema),
      defaultValues: {
        tipo: data.tipo,
        empresaId: data.empresaId,
        cnpj: data.cnpj,
        responsavelEmpresa: data.responsavelEmpresa,
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

            <InputField label="Responsável da Empresa" inputId="responsavelEmpresa">
              <input id="responsavelEmpresa" {...register('responsavelEmpresa')} onBlur={syncFormToParent}
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
