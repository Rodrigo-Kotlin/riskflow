import { forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSection, InputField } from '@/components/forms/FormSection'
import { Levantamento, CaracteristicasLocal } from '@/types'

const stepSchema = z.object({
  setor: z.string().min(1, 'Campo obrigatório'),
  qtdColaboradores: z.string().min(1, 'Informe ao menos 1 colaborador'),
  dimensoes: z.string().optional(),
  peDireito: z.string().optional(),
  pavimento: z.string().optional(),
  paredesVedacao: z.string().optional(),
  divisoria: z.string().optional(),
  piso: z.string().optional(),
  revestimento: z.string().optional(),
  forro: z.string().optional(),
  telhado: z.string().optional(),
  iluminacaoNatural: z.string().optional(),
  iluminacaoArtificial: z.string().optional(),
  ventilacaoNatural: z.string().optional(),
  ventilacaoArtificial: z.string().optional(),
  sistemaIncendio: z.string().optional(),
  possibilidadeGES: z.string().optional(),
  mobiliarios: z.string().optional(),
  maquinasEquipamentos: z.string().optional(),
  epis: z.string().optional(),
  epcs: z.string().optional(),
})

type StepForm = z.infer<typeof stepSchema>

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
}

export const Step02Caracteristicas = forwardRef<{ trigger: () => Promise<boolean> }, Props>(
  ({ data, updateData }, ref) => {
    const c = useMemo(() => data.caracteristicas || {}, [data.caracteristicas])

    const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm<StepForm>({
      resolver: zodResolver(stepSchema),
      defaultValues: {
        setor: c.setor,
        qtdColaboradores: String(c.qtdColaboradores),
        dimensoes: c.dimensoes,
        peDireito: c.peDireito,
        pavimento: c.pavimento,
        paredesVedacao: c.paredesVedacao,
        divisoria: c.divisoria,
        piso: c.piso,
        revestimento: c.revestimento,
        forro: c.forro,
        telhado: c.telhado,
        iluminacaoNatural: c.iluminacaoNatural,
        iluminacaoArtificial: c.iluminacaoArtificial,
        ventilacaoNatural: c.ventilacaoNatural,
        ventilacaoArtificial: c.ventilacaoArtificial,
        sistemaIncendio: c.sistemaIncendio,
        possibilidadeGES: c.possibilidadeGES,
        mobiliarios: c.mobiliarios,
        maquinasEquipamentos: c.maquinasEquipamentos,
        epis: c.epis,
        epcs: c.epcs,
      },
    })

    useImperativeHandle(ref, () => ({ trigger }), [trigger])

    useEffect(() => {
      const sub = watch((values) => {
        updateData({ caracteristicas: { ...c, ...values } as unknown as CaracteristicasLocal })
      })
      return () => sub.unsubscribe()
    }, [watch, updateData, c])

    return (
      <form onSubmit={handleSubmit((v) => updateData({ caracteristicas: { ...c, ...v } as unknown as CaracteristicasLocal }))}>
        <FormSection title="Características do Local" collapsible>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Setor/Departamento" required error={errors.setor?.message} inputId="caracteristicas-setor">
              <input id="caracteristicas-setor" {...register('setor')} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>
            <InputField label="Qtd. Colaboradores" required error={errors.qtdColaboradores?.message} inputId="caracteristicas-qtdColaboradores">
              <input id="caracteristicas-qtdColaboradores" type="number" {...register('qtdColaboradores')} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
            </InputField>
            <InputField label="Dimensões do Ambiente" inputId="caracteristicas-dimensoes">
              <input id="caracteristicas-dimensoes" {...register('dimensoes')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Pé-direito" inputId="caracteristicas-peDireito">
              <input id="caracteristicas-peDireito" {...register('peDireito')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Pavimento" inputId="caracteristicas-pavimento">
              <input id="caracteristicas-pavimento" {...register('pavimento')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Paredes/Vedação" inputId="caracteristicas-paredesVedacao">
              <input id="caracteristicas-paredesVedacao" {...register('paredesVedacao')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Divisórias" inputId="caracteristicas-divisoria">
              <input id="caracteristicas-divisoria" {...register('divisoria')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Piso" inputId="caracteristicas-piso">
              <input id="caracteristicas-piso" {...register('piso')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Revestimento" inputId="caracteristicas-revestimento">
              <input id="caracteristicas-revestimento" {...register('revestimento')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Forro" inputId="caracteristicas-forro">
              <input id="caracteristicas-forro" {...register('forro')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Telhado" inputId="caracteristicas-telhado">
              <input id="caracteristicas-telhado" {...register('telhado')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Iluminação Natural" inputId="caracteristicas-iluminacaoNatural">
              <input id="caracteristicas-iluminacaoNatural" {...register('iluminacaoNatural')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Iluminação Artificial" inputId="caracteristicas-iluminacaoArtificial">
              <input id="caracteristicas-iluminacaoArtificial" {...register('iluminacaoArtificial')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Ventilação Natural" inputId="caracteristicas-ventilacaoNatural">
              <input id="caracteristicas-ventilacaoNatural" {...register('ventilacaoNatural')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Ventilação Artificial" inputId="caracteristicas-ventilacaoArtificial">
              <input id="caracteristicas-ventilacaoArtificial" {...register('ventilacaoArtificial')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
          </div>
        </FormSection>

        <FormSection title="Segurança e Equipamentos" collapsible>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Sistema de Incêndio/Emergência" inputId="caracteristicas-sistemaIncendio">
              <input id="caracteristicas-sistemaIncendio" {...register('sistemaIncendio')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Possibilidade de GES" inputId="caracteristicas-possibilidadeGES">
              <input id="caracteristicas-possibilidadeGES" {...register('possibilidadeGES')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Mobiliários" inputId="caracteristicas-mobiliarios">
              <input id="caracteristicas-mobiliarios" {...register('mobiliarios')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="Máquinas e Equipamentos" inputId="caracteristicas-maquinasEquipamentos">
              <input id="caracteristicas-maquinasEquipamentos" {...register('maquinasEquipamentos')} className="w-full h-10 px-3 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="EPIs Encontrados (com CA)" inputId="caracteristicas-epis">
              <textarea id="caracteristicas-epis" {...register('epis')} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </InputField>
            <InputField label="EPCs Encontrados" inputId="caracteristicas-epcs">
              <textarea id="caracteristicas-epcs" {...register('epcs')} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
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
