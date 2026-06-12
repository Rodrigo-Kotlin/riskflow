import { LABELS_CARACTERISTICAS } from '@/constants/labels'
import { Badge } from '@/components/ui/Badge'
import { NIVEIS_RISCO } from '@/constants'
import { Levantamento } from '@/types'
import { formatDate } from '@/lib/utils'

interface ReportPreviewProps {
  levantamento: Levantamento
  modelo: 'Completo' | 'Executivo'
}

export function ReportPreview({ levantamento, modelo }: ReportPreviewProps) {
  const l = levantamento

  return (
    <div className="bg-white border border-border rounded-xl p-6 md:p-10 text-sm print:p-0 print:border-0">
      <div className="text-center mb-8 pb-6 border-b-2 border-brand-500">
        <h1 className="text-xl font-bold text-text-primary">Efetiva RiskFlow — LPR/AEP Digital</h1>
        <p className="text-xs text-text-secondary mt-1">Levantamento de Perigos e Riscos / Análise Ergonômica Preliminar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-2">Identificação</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="text-text-secondary py-1 pr-2 w-40">Empresa:</td><td className="font-medium">{l.empresaNome}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">CNPJ:</td><td className="font-medium">{l.cnpj}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Unidade:</td><td className="font-medium">{l.unidade}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Setor:</td><td className="font-medium">{l.setor}</td></tr>
              <tr><td className="text-text-secondary py-1 pr-2">Tipo:</td><td className="font-medium">{l.tipo}</td></tr>
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
              <tr><td className="text-text-secondary py-1 pr-2">Registro:</td><td className="font-medium">{l.registroMTE}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {modelo === 'Completo' && (
        <>
          <Section title="Características do Local">
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(l.caracteristicas).filter(([k]) => k !== 'imagens').map(([key, value]) => (
                  <tr key={key}>
                    <td className="text-text-secondary py-1 pr-2 w-40">{LABELS_CARACTERISTICAS[key] ?? key}:</td>
                    <td className="font-medium">{String(value) || '-'}</td>
                  </tr>
                ))}
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

      {(l.assinaturaTecnico.confirmada || l.assinaturaEmpresa.confirmada) && (
        <Section title="Assinaturas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {l.assinaturaTecnico.confirmada && (
              <div className="p-3 border border-border rounded-lg">
                <p className="text-xs font-bold text-text-primary">Responsável Técnico</p>
                <p className="text-xs">{l.assinaturaTecnico.nomeCompleto}</p>
                <p className="text-xs text-text-secondary">CPF: {l.assinaturaTecnico.cpf}</p>
                <p className="text-xs text-text-secondary">Data: {formatDate(l.assinaturaTecnico.dataHora)}</p>
              </div>
            )}
            {l.assinaturaEmpresa.confirmada && (
              <div className="p-3 border border-border rounded-lg">
                <p className="text-xs font-bold text-text-primary">Representante da Empresa</p>
                <p className="text-xs">{l.assinaturaEmpresa.nomeCompleto}</p>
                <p className="text-xs text-text-secondary">CPF: {l.assinaturaEmpresa.cpf}</p>
                <p className="text-xs text-text-secondary">Data: {formatDate(l.assinaturaEmpresa.dataHora)}</p>
              </div>
            )}
          </div>
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
