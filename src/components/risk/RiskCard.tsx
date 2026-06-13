import { Risco } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { Eye, Copy, Trash2, Edit3 } from 'lucide-react'
import { NIVEIS_RISCO, SITUACAO_RISCO } from '@/constants'

interface RiskCardProps {
  risco: Risco
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onView: () => void
}

export function RiskCard({ risco, onEdit, onDelete, onDuplicate, onView }: RiskCardProps) {
  return (
    <div className={cn('bg-card border rounded-xl p-4 space-y-3 transition-all hover:shadow-md', getBorderColor(risco.nivel))}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={risco.nivel === NIVEIS_RISCO.CRITICO ? 'risk-critical' : risco.nivel === NIVEIS_RISCO.ALTO ? 'risk-high' : risco.nivel === NIVEIS_RISCO.MODERADO ? 'risk-moderate' : 'risk-low'}>
              {risco.nivel}
            </Badge>
            <Badge variant="info">{risco.categoria}</Badge>
            <Badge variant={risco.situacao === SITUACAO_RISCO.NAO_CONTROLADO ? 'danger' : risco.situacao === SITUACAO_RISCO.CONTROLE_INSUFICIENTE ? 'warning' : 'success'}>
              {risco.situacao}
            </Badge>
          </div>
          <h4 className="text-sm font-semibold text-text-primary mt-1">{risco.perigo}</h4>
          <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{risco.dano}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onView} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" title="Detalhes" aria-label="Ver detalhes do risco">
            <Eye size={16} />
          </button>
          <button onClick={onEdit} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" title="Editar" aria-label="Editar risco">
            <Edit3 size={16} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Severidade: {risco.severidade}</span>
          <span>Prob.: {risco.probabilidade}</span>
          <span className="font-bold">Score: {risco.pontuacao}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" title="Duplicar" aria-label="Duplicar risco">
            <Copy size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-text-secondary hover:text-risk-high rounded-lg hover:bg-red-50" title="Excluir" aria-label="Excluir risco">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function getBorderColor(nivel: string): string {
  switch (nivel) {
    case NIVEIS_RISCO.CRITICO: return 'border-red-300'
    case NIVEIS_RISCO.ALTO: return 'border-red-200'
    case NIVEIS_RISCO.MODERADO: return 'border-amber-200'
    case NIVEIS_RISCO.BAIXO: return 'border-green-200'
    default: return 'border-border'
  }
}
