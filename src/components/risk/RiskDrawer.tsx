import { Risco } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { NIVEIS_RISCO } from '@/constants'

interface RiskDrawerProps {
  open: boolean
  onClose: () => void
  risco: Risco | null
}

export function RiskDrawer({ open, onClose, risco }: RiskDrawerProps) {
  if (!risco) return null

  return (
    <Drawer open={open} onClose={onClose} title="Detalhes do Risco">
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={risco.nivel === NIVEIS_RISCO.CRITICO ? 'risk-critical' : risco.nivel === NIVEIS_RISCO.ALTO ? 'risk-high' : risco.nivel === NIVEIS_RISCO.MODERADO ? 'risk-moderate' : 'risk-low'}>{risco.nivel}</Badge>
          <Badge variant="info">{risco.categoria}</Badge>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-text-primary">{risco.perigo}</h4>
          <p className="text-sm text-text-secondary mt-1">{risco.dano}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
          <div><span className="text-xs text-text-secondary">Severidade</span><p className="text-sm font-medium">{risco.severidade}/5</p></div>
          <div><span className="text-xs text-text-secondary">Probabilidade</span><p className="text-sm font-medium">{risco.probabilidade}/5</p></div>
          <div><span className="text-xs text-text-secondary">Pontuação</span><p className="text-sm font-bold">{risco.pontuacao}</p></div>
          <div><span className="text-xs text-text-secondary">Situação</span><p className="text-sm">{risco.situacao}</p></div>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Fonte Geradora</h5>
          <p className="text-sm">{risco.fonteGeradora || 'Não informado'}</p>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Meio de Propagação</h5>
          <p className="text-sm">{risco.meioPropagacao || 'N/A'}</p>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Controle na Fonte</h5>
          <p className="text-sm">{risco.controleFonte || 'Não informado'}</p>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Controle na Trajetória</h5>
          <p className="text-sm">{risco.controleTrajetoria || 'Não informado'}</p>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Controle no Trabalhador</h5>
          <p className="text-sm">{risco.controleTrabalhador || 'Não informado'}</p>
        </div>

        {risco.observacoes && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Observações Técnicas</h5>
            <p className="text-sm text-text-secondary">{risco.observacoes}</p>
          </div>
        )}

        <div className="text-[10px] text-text-secondary flex items-center gap-1">
          {risco.avaliacaoQuantitativa ? 'Avaliação quantitativa: Sim' : 'Avaliação quantitativa: Não'}
        </div>
      </div>
    </Drawer>
  )
}
