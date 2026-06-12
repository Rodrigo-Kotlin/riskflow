import { Risco } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Eye, Edit3, Copy, Trash2 } from 'lucide-react'
import { NIVEIS_RISCO, SITUACAO_RISCO } from '@/constants'

interface RiskTableProps {
  riscos: Risco[]
  onEdit: (risco: Risco) => void
  onDelete: (id: string) => void
  onDuplicate: (risco: Risco) => void
  onView: (risco: Risco) => void
}

export function RiskTable({ riscos, onEdit, onDelete, onDuplicate, onView }: RiskTableProps) {
  return (
    <div className="overflow-x-auto hidden md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-text-secondary">Perigo/Agente</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-text-secondary">Categoria</th>
            <th className="text-center py-2.5 px-3 text-xs font-medium text-text-secondary">Sever.</th>
            <th className="text-center py-2.5 px-3 text-xs font-medium text-text-secondary">Prob.</th>
            <th className="text-center py-2.5 px-3 text-xs font-medium text-text-secondary">Score</th>
            <th className="text-center py-2.5 px-3 text-xs font-medium text-text-secondary">Nível</th>
            <th className="text-center py-2.5 px-3 text-xs font-medium text-text-secondary">Situação</th>
            <th className="text-center py-2.5 px-3 text-xs font-medium text-text-secondary">Ações</th>
          </tr>
        </thead>
        <tbody>
          {riscos.map((risco) => (
            <tr key={risco.id} className="border-b border-border hover:bg-gray-50 transition-colors">
              <td className="py-2.5 px-3 text-sm font-medium text-text-primary">{risco.perigo}</td>
              <td className="py-2.5 px-3"><Badge variant="info">{risco.categoria}</Badge></td>
              <td className="py-2.5 px-3 text-center text-sm">{risco.severidade}</td>
              <td className="py-2.5 px-3 text-center text-sm">{risco.probabilidade}</td>
              <td className="py-2.5 px-3 text-center text-sm font-bold">{risco.pontuacao}</td>
              <td className="py-2.5 px-3 text-center">
                <Badge variant={risco.nivel === NIVEIS_RISCO.CRITICO ? 'risk-critical' : risco.nivel === NIVEIS_RISCO.ALTO ? 'risk-high' : risco.nivel === NIVEIS_RISCO.MODERADO ? 'risk-moderate' : 'risk-low'}>
                  {risco.nivel}
                </Badge>
              </td>
              <td className="py-2.5 px-3 text-center">
                <Badge variant={risco.situacao === SITUACAO_RISCO.NAO_CONTROLADO ? 'danger' : risco.situacao === SITUACAO_RISCO.CONTROLE_INSUFICIENTE ? 'warning' : 'success'}>
                  {risco.situacao}
                </Badge>
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onView(risco)} className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" title="Detalhes" aria-label="Ver detalhes do risco"><Eye size={14} /></button>
                  <button onClick={() => onEdit(risco)} className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" title="Editar" aria-label="Editar risco"><Edit3 size={14} /></button>
                  <button onClick={() => onDuplicate(risco)} className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100" title="Duplicar" aria-label="Duplicar risco"><Copy size={14} /></button>
                  <button onClick={() => onDelete(risco.id)} className="p-1 text-text-secondary hover:text-risk-high rounded hover:bg-red-50" title="Excluir" aria-label="Excluir risco"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
