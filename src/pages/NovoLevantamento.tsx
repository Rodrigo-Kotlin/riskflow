import { useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
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
import { Save, ArrowLeft, ArrowRight, Check, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useLevantamentoEditor, SaveStatus } from '@/hooks/useLevantamentoEditor'

const steps = [
  { label: 'Identificação', sublabel: 'Dados gerais' },
  { label: 'Características', sublabel: 'Do local' },
  { label: 'Medições', sublabel: 'Pontuais' },
  { label: 'Colaboradores', sublabel: 'Atividades' },
  { label: 'Perigos e Riscos', sublabel: 'Inventário' },
  { label: 'Controles', sublabel: 'Plano de ação' },
  { label: 'Parecer', sublabel: 'Técnico' },
  { label: 'Revisão', sublabel: 'Final' },
]

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') return <span className="flex items-center gap-1 text-xs text-text-secondary"><Loader2 size={12} className="animate-spin" /> Salvando...</span>
  if (status === 'saved') return <span className="flex items-center gap-1 text-xs text-risk-low"><CheckCircle2 size={12} /> Alterações salvas</span>
  if (status === 'saved-local') return <span className="flex items-center gap-1 text-xs text-risk-moderate"><AlertTriangle size={12} /> Salvo apenas neste dispositivo</span>
  if (status === 'error') return <span className="flex items-center gap-1 text-xs text-risk-high"><AlertTriangle size={12} /> Erro ao salvar</span>
  return null
}

export function NovoLevantamento() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toasts } = useApp()
  const { levantamento, currentStep, progresso, saveStatus, handleNext, handleBack, updateData, salvarRascunho, finalizar } = useLevantamentoEditor()
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const stepRef = useRef<{ trigger: () => Promise<boolean> }>(null)

  const onNext = async () => {
    if (currentStep < 2 && stepRef.current) {
      const valid = await stepRef.current.trigger()
      if (!valid) return
    }
    handleNext()
  }

  const handleFinish = useCallback(async () => {
    if (isFinalizing) return
    if (!levantamento.empresaNome?.trim()) {
      toasts.addToast('error', 'Dados insuficientes', 'Identificação da empresa é obrigatória.')
      return
    }
    if (!levantamento.caracteristicas?.qtdColaboradores) {
      toasts.addToast('error', 'Dados insuficientes', 'Informe ao menos 1 colaborador nas Características do Local.')
      return
    }
    if (levantamento.riscos.length === 0) {
      toasts.addToast('error', 'Dados insuficientes', 'Cadastre ao menos um risco no inventário.')
      return
    }
    if (levantamento.controles.length === 0) {
      toasts.addToast('error', 'Dados insuficientes', 'Cadastre ao menos um controle ou plano de ação.')
      return
    }
    setIsFinalizing(true)
    try {
      const result = await finalizar()
      if (result.saved) {
        if (result.local) {
          toasts.addToast('warning', 'Finalizado localmente', 'O levantamento foi salvo apenas neste dispositivo. Sincronize quando possível.')
        } else {
          toasts.addToast('success', 'Levantamento finalizado!', 'O levantamento foi finalizado com sucesso.')
        }
        navigate('/levantamentos')
      } else {
        toasts.addToast('error', 'Erro ao finalizar', 'Não foi possível finalizar o levantamento. Tente novamente.')
      }
    } catch {
      toasts.addToast('error', 'Erro ao finalizar', 'Ocorreu um erro inesperado ao finalizar o levantamento.')
    } finally {
      setIsFinalizing(false)
    }
  }, [isFinalizing, finalizar, toasts, navigate, levantamento])

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
      case 7: return <Step08Revisao {...stepProps} />
      default: return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{id ? 'Editar Levantamento' : 'Novo Levantamento'}</h1>
          <p className="text-sm text-text-secondary">{levantamento.codigo ? `${levantamento.codigo} — ` : ''}{levantamento.tipo}</p>
        </div>
        <button onClick={() => navigate('/levantamentos')} className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <Stepper steps={steps} currentStep={currentStep} percentual={progresso} />

      <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-4">
        {renderStep()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button onClick={handleBack} className="btn-secondary">
                <ArrowLeft size={16} /> Anterior
              </button>
            )}
            <SaveStatusIndicator status={saveStatus} />
          </div>
          {currentStep < steps.length - 1 ? (
            <button onClick={onNext} className="btn-primary">
              Próxima Etapa <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={() => setShowFinishConfirm(true)} disabled={isFinalizing} className="btn-primary bg-risk-low hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {isFinalizing ? <><Loader2 size={16} className="animate-spin" /> Finalizando...</> : <><Check size={16} /> Finalizar Levantamento</>}
            </button>
          )}
        </div>
        <div className="flex justify-center">
          <button onClick={salvarRascunho} className="btn-secondary">
            <Save size={16} /> Salvar Rascunho
          </button>
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
