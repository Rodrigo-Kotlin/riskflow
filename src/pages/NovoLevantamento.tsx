import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/components/layout/AppShell'
import { Stepper } from '@/components/forms/Stepper'
import { Step01Identificacao } from './steps/Step01Identificacao'
import { Step02Caracteristicas } from './steps/Step02Caracteristicas'
import { Step03Medicoes } from './steps/Step03Medicoes'
import { Step04Colaboradores } from './steps/Step04Colaboradores'
import { Step05PerigosRiscos } from './steps/Step05PerigosRiscos'
import { Step06Controles } from './steps/Step06Controles'
import { Step07Parecer } from './steps/Step07Parecer'
import { Step08Revisao } from './steps/Step08Revisao'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Save, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useLevantamentoEditor } from '@/hooks/useLevantamentoEditor'

const steps = [
  { label: 'Identificação', sublabel: 'Dados gerais' },
  { label: 'Características', sublabel: 'Do local' },
  { label: 'Medições', sublabel: 'Pontuais' },
  { label: 'Colaboradores', sublabel: 'Atividades' },
  { label: 'Perigos e Riscos', sublabel: 'Inventário' },
  { label: 'Controles', sublabel: 'Plano de ação' },
  { label: 'Parecer', sublabel: 'Técnico' },
  { label: 'Revisão', sublabel: 'Assinaturas' },
]

export function NovoLevantamento() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toasts } = useApp()
  const { levantamento, currentStep, progresso, handleNext, handleBack, updateData, salvarRascunho, finalizar } = useLevantamentoEditor()
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const stepRef = useRef<{ trigger: () => Promise<boolean> }>(null)

  const onNext = async () => {
    if (currentStep < 2 && stepRef.current) {
      const valid = await stepRef.current.trigger()
      if (!valid) return
    }
    handleNext()
  }

  const handleFinish = () => {
    finalizar()
    toasts.addToast('success', 'Levantamento concluído!', 'O levantamento foi finalizado com sucesso.')
    navigate('/levantamentos')
  }

  const stepProps = { data: levantamento, updateData, saveRascunho: salvarRascunho, toasts }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step01Identificacao ref={stepRef} {...stepProps} />
      case 1: return <Step02Caracteristicas ref={stepRef} {...stepProps} />
      case 2: return <Step03Medicoes {...stepProps} />
      case 3: return <Step04Colaboradores {...stepProps} />
      case 4: return <Step05PerigosRiscos {...stepProps} />
      case 5: return <Step06Controles {...stepProps} />
      case 6: return <Step07Parecer {...stepProps} />
      case 7: return <Step08Revisao {...stepProps} onFinish={handleFinish} />
      default: return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{id ? 'Editar Levantamento' : 'Novo Levantamento'}</h1>
          <p className="text-sm text-text-secondary">{levantamento.codigo} — {levantamento.tipo}</p>
        </div>
        <button onClick={() => navigate('/levantamentos')} className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <Stepper steps={steps} currentStep={currentStep} percentual={progresso} />

      <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-4">
        {renderStep()}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          {currentStep > 0 && (
            <button onClick={handleBack} className="flex items-center gap-1 h-10 px-4 text-sm font-medium text-text-secondary hover:text-text-primary bg-white border border-border rounded-lg hover:bg-gray-50">
              <ArrowLeft size={16} /> Anterior
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={salvarRascunho} className="flex items-center gap-1 h-10 px-4 text-sm font-medium text-text-secondary hover:text-text-primary bg-white border border-border rounded-lg hover:bg-gray-50">
            <Save size={16} /> Salvar Rascunho
          </button>
          {currentStep < steps.length - 1 ? (
            <button onClick={onNext} className="flex items-center gap-1 h-10 px-5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors">
              Próxima Etapa <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={() => setShowFinishConfirm(true)} className="flex items-center gap-1 h-10 px-5 bg-risk-low hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
              <Check size={16} /> Finalizar Levantamento
            </button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={showFinishConfirm}
        onClose={() => setShowFinishConfirm(false)}
        onConfirm={() => { setShowFinishConfirm(false); handleFinish() }}
        title="Finalizar Levantamento"
        message="Após finalizar, o levantamento não poderá ser editado. Deseja continuar?"
        confirmText="Finalizar"
        variant="default"
      />
    </div>
  )
}
