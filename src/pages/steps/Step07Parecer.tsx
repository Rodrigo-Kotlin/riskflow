import { AlertCircle, Sparkles } from 'lucide-react'
import { Levantamento } from '@/types'
import { NIVEIS_RISCO } from '@/constants'

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
  toasts: any
}

export function Step07Parecer({ data, updateData, toasts }: Props) {
  const gerarParecer = () => {
    const riscosCriticos = data.riscos.filter((r: any) => r.nivel === NIVEIS_RISCO.CRITICO)
    const riscosAltos = data.riscos.filter((r: any) => r.nivel === NIVEIS_RISCO.ALTO)
    const riscosModerados = data.riscos.filter((r: any) => r.nivel === NIVEIS_RISCO.MODERADO)
    const riscosBaixos = data.riscos.filter((r: any) => r.nivel === NIVEIS_RISCO.BAIXO)

    const texto = `PARECER TÉCNICO DE ${data.tipo}

Empresa: ${data.empresaNome}
CNPJ: ${data.cnpj}
Unidade: ${data.unidade}
Setor: ${data.setor}
Data do levantamento: ${data.dataLevantamento}
Responsável técnico: ${data.auditorTecnico} — Registro: ${data.registroMTE}

1. OBJETIVO
Realizar o Levantamento de Perigos e Riscos (LPR) no setor ${data.setor} da empresa ${data.empresaNome}, conforme requisitos legais aplicáveis e normas regulamentadoras.

2. METODOLOGIA
Foram realizadas visitas técnicas, inspeções de segurança, entrevistas com colaboradores, medições ambientais e análise documental. A avaliação dos riscos foi realizada com base na metodologia de Severidade x Probabilidade.

3. CARACTERÍSTICAS DO LOCAL
O ambiente avaliado possui ${data.caracteristicas?.qtdColaboradores || 0} colaboradores, dimensões de ${data.caracteristicas?.dimensoes || 'não informado'}, pé-direito de ${data.caracteristicas?.peDireito || 'não informado'}, localizado no pavimento ${data.caracteristicas?.pavimento || 'não informado'}.

4. MEDIÇÕES AMBIENTAIS
Foram realizadas ${data.medicoes?.length || 0} medições pontuais no ambiente de trabalho, abrangendo ruído, iluminância, temperatura e umidade.

5. INVENTÁRIO DE RISCOS
Foram identificados ${data.riscos?.length || 0} riscos, distribuídos da seguinte forma:
- Críticos: ${riscosCriticos.length}
- Altos: ${riscosAltos.length}
- Moderados: ${riscosModerados.length}
- Baixos: ${riscosBaixos.length}

${riscosCriticos.length > 0 || riscosAltos.length > 0 ? '5.1 RISCOS CRÍTICOS E ALTOS\n' + [...riscosCriticos, ...riscosAltos].map((r: any) => `- ${r.perigo} (${r.nivel}): ${r.fonteGeradora}`).join('\n') : ''}

6. CONTROLES RECOMENDADOS
Foram propostas ${data.controles?.length || 0} medidas de controle, organizadas por prioridade, com responsáveis e prazos definidos.

7. AVALIAÇÃO COMPLEMENTAR
${riscosCriticos.length > 0 || riscosAltos.length > 0 ? 'Recomenda-se a realização de avaliação quantitativa complementar para os riscos classificados como Altos e Críticos, além da elaboração ou revisão do PGR e PCMSO, quando aplicável.' : 'Os riscos identificados encontram-se em níveis aceitáveis ou com controles adequados. Recomenda-se a manutenção dos controles existentes e monitoramento periódico.'}

8. CONCLUSÃO
Com base na análise técnica realizada, conclui-se que o setor ${data.setor} da empresa ${data.empresaNome} apresenta riscos ocupacionais que exigem ações de controle e monitoramento. Recomenda-se a implementação do plano de ação proposto e a revisão periódica deste levantamento.

Este parecer foi gerado automaticamente pelo sistema Efetiva RiskFlow e deve ser revisado e validado por profissional legalmente habilitado antes da emissão final.

${data.auditorTecnico || 'Profissional Responsável'}
Registro: ${data.registroMTE || '_______________'}`

    updateData({ parecer: { texto, editado: false } })
    toasts.addToast('success', 'Parecer gerado', 'O parecer técnico automático foi gerado com sucesso.')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Parecer Técnico</h3>
          <p className="text-xs text-text-secondary">Descreva o parecer técnico do levantamento</p>
        </div>
        <button onClick={gerarParecer} className="flex items-center gap-1 h-9 px-4 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
          <Sparkles size={16} /> Gerar parecer automático
        </button>
      </div>

      <div className="relative">
        <label htmlFor="parecer-texto" className="sr-only">Parecer Técnico</label>
        <textarea
          id="parecer-texto"
          value={data.parecer?.texto || ''}
          onChange={(e) => updateData({ parecer: { texto: e.target.value, editado: true } })}
          rows={18}
          className="w-full px-4 py-3 rounded-lg border border-border text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/70 resize-y"
          placeholder="Digite ou gere o parecer técnico automaticamente..."
        />
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle size={16} className="text-risk-moderate shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          O parecer deve ser revisado e validado por profissional legalmente habilitado antes da emissão final.
        </p>
      </div>
    </div>
  )
}
