import { Badge } from '@/components/ui/Badge'
import { NIVEIS_RISCO } from '@/constants'
import { Levantamento, ItemComQuantidade } from '@/types'
import { formatDate } from '@/lib/utils'

interface ReportPreviewProps {
  levantamento: Levantamento
  modelo: 'Completo' | 'Executivo'
}

function parseItens(value: string): ItemComQuantidade[] {
  try { const p = JSON.parse(value); return Array.isArray(p) ? p : [] } catch { return [] }
}

function parseList(value: string): string[] {
  try { const p = JSON.parse(value); return Array.isArray(p) ? p : [] } catch { return [] }
}

function formatMobiliarios(value: string): string {
  const itens = parseItens(value)
  if (itens.length === 0) return value || '-'
  return itens.map(i => `${i.nome} (${i.quantidade})`).join(', ')
}

function formatEquipamentos(value: string): string {
  const itens = parseItens(value)
  if (itens.length === 0) return value || '-'
  return itens.map(i => `${i.nome} (${i.quantidade})`).join(', ')
}

export function ReportPreview({ levantamento, modelo }: ReportPreviewProps) {
  const l = levantamento
  const c = l.caracteristicas || {} as Levantamento['caracteristicas']

  return (
    <div className="bg-white border border-border rounded-xl p-6 md:p-10 text-sm print:p-0 print:border-0">
      <div className="text-center mb-8 pb-6 border-b-2 border-brand-500">
        <h1 className="text-xl font-bold text-text-primary">Efetiva RiskFlow — LPR/AEP Digital</h1>
        <p className="text-xs text-text-secondary mt-1">Levantamento de Perigos e Riscos / Análise Ergonômica Preliminar</p>
        {l.codigo && <p className="text-sm font-bold text-brand-500 mt-1">{l.codigo}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-2">Identificação</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="text-text-secondary py-1 pr-2 w-40">Empresa:</td><td className="font-medium">{l.empresaNome}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">CNPJ:</td><td className="font-medium">{l.cnpj}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Setor:</td><td className="font-medium">{l.setor}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Tipo:</td><td className="font-medium">{l.tipo}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Código:</td><td className="font-medium">{l.codigo}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Data:</td><td className="font-medium">{formatDate(l.dataLevantamento)}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-2">Responsáveis</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="text-text-secondary py-1 pr-2 w-40">Responsável Empresa:</td><td className="font-medium">{l.responsavelEmpresa}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Auditor Técnico:</td><td className="font-medium">{l.auditorTecnico}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {modelo === 'Completo' && (
        <>
          <Section title="Características do Local">
            <table className="w-full text-xs">
              <tbody>
                {c.comprimento || c.largura ? (
                  <tr><td className="text-text-secondary py-1 pr-2 w-40">Dimensões:</td><td className="font-medium">{c.comprimento || '0'}m x {c.largura || '0'}m</td></tr>
                ) : c.dimensoes ? (
                  <tr><td className="text-text-secondary py-1 pr-2 w-40">Dimensões:</td><td className="font-medium">{c.dimensoes}</td></tr>
                ) : null}
                {c.peDireito ? <tr><td className="text-text-secondary py-1 pr-2">Pé-direito:</td><td className="font-medium">{c.peDireito}m</td></tr> : null}
                {c.pavimento ? <tr><td className="text-text-secondary py-1 pr-2">Pavimento:</td><td className="font-medium">{c.pavimento}º</td></tr> : null}
                {c.paredesVedacao ? <tr><td className="text-text-secondary py-1 pr-2">Paredes:</td><td className="font-medium">{c.paredesVedacao}</td></tr> : null}
                {c.divisoria ? <tr><td className="text-text-secondary py-1 pr-2">Divisórias:</td><td className="font-medium">{c.divisoria}</td></tr> : null}
                {c.piso ? <tr><td className="text-text-secondary py-1 pr-2">Piso:</td><td className="font-medium">{c.piso}</td></tr> : null}
                {c.forro ? <tr><td className="text-text-secondary py-1 pr-2">Forro:</td><td className="font-medium">{c.forro}</td></tr> : null}
                {c.telhado ? <tr><td className="text-text-secondary py-1 pr-2">Telhado:</td><td className="font-medium">{c.telhado}</td></tr> : null}
                {c.iluminacaoNatural ? <tr><td className="text-text-secondary py-1 pr-2">Iluminação Natural:</td><td className="font-medium">{c.iluminacaoNatural}</td></tr> : null}
                {c.iluminacaoArtificial ? <tr><td className="text-text-secondary py-1 pr-2">Iluminação Artificial:</td><td className="font-medium">{c.iluminacaoArtificial}</td></tr> : null}
                {c.ventilacaoNatural ? <tr><td className="text-text-secondary py-1 pr-2">Ventilação Natural:</td><td className="font-medium">{c.ventilacaoNatural}</td></tr> : null}
                {c.ventilacaoArtificial ? <tr><td className="text-text-secondary py-1 pr-2">Ventilação Artificial:</td><td className="font-medium">{c.ventilacaoArtificial}</td></tr> : null}
                {c.qtdColaboradores ? <tr><td className="text-text-secondary py-1 pr-2">Colaboradores:</td><td className="font-medium">{c.qtdColaboradores}</td></tr> : null}
                {c.sistemaIncendio ? <tr><td className="text-text-secondary py-1 pr-2">Sistema Incêndio:</td><td className="font-medium">{parseList(c.sistemaIncendio).join(', ') || c.sistemaIncendio}</td></tr> : null}
                {c.mobiliarios ? <tr><td className="text-text-secondary py-1 pr-2">Mobiliários:</td><td className="font-medium">{formatMobiliarios(c.mobiliarios)}</td></tr> : null}
                {c.maquinasEquipamentos ? <tr><td className="text-text-secondary py-1 pr-2">Equipamentos:</td><td className="font-medium">{formatEquipamentos(c.maquinasEquipamentos)}</td></tr> : null}
                {c.epis ? <tr><td className="text-text-secondary py-1 pr-2">EPIs:</td><td className="font-medium">{c.epis}</td></tr> : null}
                {c.epcs ? <tr><td className="text-text-secondary py-1 pr-2">EPCs:</td><td className="font-medium">{c.epcs}</td></tr> : null}
              </tbody>
            </table>
          </Section>

          {l.medicoes.length > 0 && (
            <Section title="Medições Pontuais">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 font-medium text-text-secondary">Posto</th>
                    <th className="text-left p-2 font-medium text-text-secondary">Ruído dB(A)</th>
                    <th className="text-left p-2 font-medium text-text-secondary">Iluminância lux</th>
                    <th className="text-left p-2 font-medium text-text-secondary">Temperatura</th>
                    <th className="text-left p-2 font-medium text-text-secondary">Umidade</th>
                  </tr>
                </thead>
                <tbody>
                  {l.medicoes.map((m) => (
                    <tr key={m.id} className="border-t border-border">
                      <td className="p-2">{m.postoLocal}</td>
                      <td className="p-2">{m.ruidoDbA}</td>
                      <td className="p-2">{m.iluminanciaLux}</td>
                      <td className="p-2">{m.temperatura}°C</td>
                      <td className="p-2">{m.umidade}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      )}

      <Section title="Inventário de Riscos">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 font-medium text-text-secondary">Perigo</th>
              <th className="text-left p-2 font-medium text-text-secondary">Categoria</th>
              <th className="text-center p-2 font-medium text-text-secondary">Score</th>
              <th className="text-center p-2 font-medium text-text-secondary">Nível</th>
              <th className="text-left p-2 font-medium text-text-secondary">Controle</th>
            </tr>
          </thead>
          <tbody>
            {l.riscos.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2 font-medium">{r.perigo}</td>
                <td className="p-2">{r.categoria}</td>
                <td className="p-2 text-center font-bold">{r.pontuacao}</td>
                <td className="p-2 text-center">
                  <Badge variant={r.nivel === NIVEIS_RISCO.CRITICO ? 'risk-critical' : r.nivel === NIVEIS_RISCO.ALTO ? 'risk-high' : r.nivel === NIVEIS_RISCO.MODERADO ? 'risk-moderate' : 'risk-low'}>{r.nivel}</Badge>
                </td>
                <td className="p-2">{r.controleFonte || r.controleTrajetoria || r.controleTrabalhador || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {l.parecer.texto && (
        <Section title="Parecer Técnico">
          <p className="text-xs text-text-primary whitespace-pre-wrap">{l.parecer.texto}</p>
          <p className="text-[10px] text-text-secondary mt-2 italic">O parecer deve ser revisado e validado por profissional legalmente habilitado antes da emissão final.</p>
        </Section>
      )}

      <div className="text-center text-[10px] text-text-secondary mt-8 pt-4 border-t border-border">
        <p>Documento gerado pelo Efetiva RiskFlow — LPR/AEP Digital</p>
        <p>Data de emissão: {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-text-primary mb-3 pb-1 border-b border-border">{title}</h3>
      {children}
    </div>
  )
}
