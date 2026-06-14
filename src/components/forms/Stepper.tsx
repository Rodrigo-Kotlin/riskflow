import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
  sublabel?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  percentual: number
}

export function Stepper({ steps, currentStep, percentual }: StepperProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text-primary">
            Etapa {currentStep + 1} de {steps.length}
          </span>
          <span className="text-xs text-text-secondary md:hidden">{steps[currentStep]?.label}</span>
        </div>
        <span className="text-sm font-medium text-brand-500">{percentual}% concluído</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${percentual}%` }} />
      </div>
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          return (
            <div key={index} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  isCompleted ? 'bg-brand-500 text-white' : isCurrent ? 'bg-brand-500 text-white ring-4 ring-brand-100' : 'bg-gray-200 text-text-secondary'
                )}>
                  {isCompleted ? <Check size={16} /> : index + 1}
                </div>
                <div className="hidden lg:block">
                  <p className={cn('text-sm font-medium', isCurrent ? 'text-text-primary' : 'text-text-secondary')}>{step.label}</p>
                  {step.sublabel && <p className="text-xs text-text-secondary">{step.sublabel}</p>}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn('w-12 h-0.5 mx-2', index < currentStep ? 'bg-brand-500' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
