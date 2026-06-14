import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export function FormSection({ title, description, children, collapsible = false, defaultOpen = true, className }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = open ? ChevronDown : ChevronRight

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => collapsible && setOpen(!open)}
        className={cn('w-full flex items-center justify-between p-4', collapsible ? 'cursor-pointer' : 'cursor-default')}
      >
        <div className="text-left">
          <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
          {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
        </div>
        {collapsible && <Icon size={18} className="text-text-secondary shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )
}

interface InputFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
  inputId?: string
}

export function InputField({ label, required, error, children, className, inputId }: InputFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-risk-high ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-risk-high mt-1">{error}</p>}
    </div>
  )
}
