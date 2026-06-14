import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Levantamento } from '@/types'
import { useApp } from '@/components/layout/AppShell'
import { generateId, today } from '@/lib/utils'
import { STATUS_LEVANTAMENTO } from '@/constants'
import { createLevantamento, updateLevantamento, getLevantamento } from '@/services/supabase.service'
import { gerarCodigoDocumento } from '@/services/codigo.service'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function criarRascunhoVazio(): Levantamento {
  return {
    id: generateId(),
    tipo: 'LPR',
    codigo: '',
    empresaId: '', empresaNome: '', cnpj: '', unidade: '', setor: '',
    responsavelEmpresa: '', auditorTecnico: '', registroMTE: '',
    dataLevantamento: today(), dataLancamentoSGG: '', responsavelLancamento: '',
    status: STATUS_LEVANTAMENTO.RASCUNHO, percentual: 0,
    caracteristicas: {
      setor: '', qtdColaboradores: 0, dimensoes: '', comprimento: '', largura: '',
      peDireito: '', pavimento: '',
      paredesVedacao: '', divisoria: '', piso: '', revestimento: '', forro: '',
      telhado: '', iluminacaoNatural: '', iluminacaoArtificial: '', ventilacaoNatural: '',
      ventilacaoArtificial: '', sistemaIncendio: '', possibilidadeGES: '', mobiliarios: '',
      maquinasEquipamentos: '', epis: '', epcs: '', imagens: []
    },
    medicoes: [], colaboradores: [], riscos: [], controles: [],
    parecer: { texto: '', editado: false },
    assinaturaTecnico: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
    assinaturaEmpresa: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
    createdAt: today(), updatedAt: today(),
  }
}

function hasDraftContent(d: Levantamento): boolean {
  return !!(
    d.empresaNome?.trim() ||
    d.cnpj?.trim() ||
    d.setor?.trim() ||
    d.responsavelEmpresa?.trim() ||
    d.auditorTecnico?.trim() ||
    d.caracteristicas?.setor?.trim() ||
    (d.caracteristicas?.qtdColaboradores ?? 0) > 0 ||
    d.medicoes.length > 0 ||
    d.colaboradores.length > 0 ||
    d.riscos.length > 0 ||
    d.controles.length > 0 ||
    d.parecer?.texto?.trim()
  )
}

function calcularPercentual(d: Levantamento): number {
  let total = 0
  if (d.empresaNome) total += 14.3
  if (d.setor || d.caracteristicas.setor) total += 14.3
  if (d.medicoes.length > 0) total += 14.3
  if (d.colaboradores.length > 0) total += 14.3
  if (d.riscos.length > 0) total += 14.3
  if (d.controles.length > 0) total += 14.3
  if (d.parecer.texto) total += 14.3
  return Math.round(total)
}

export function useLevantamentoEditor() {
  const { id } = useParams()
  const { toasts } = useApp()
  const [currentStep, setCurrentStep] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const hasInteracted = useRef(false)
  const storedRef = useRef<Levantamento | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [levantamento, setLevantamento] = useState<Levantamento>(() => {
    if (id) {
      const stored = localStorage.getItem('riskflow_levantamentos')
      if (stored) {
        try {
          const list: Levantamento[] = JSON.parse(stored)
          const found = list.find(l => l.id === id)
          if (found) return { ...found }
        } catch { /* ignore */ }
      }
    }
    return criarRascunhoVazio()
  })

  const executarSave = useCallback(async (updated: Levantamento) => {
    setSaveStatus('saving')
    let toSave = { ...updated }
    try {
      if (!toSave.codigo) {
        try {
          const codigo = await gerarCodigoDocumento(toSave.tipo)
          toSave = { ...toSave, codigo }
          setLevantamento(prev => ({ ...prev, codigo }))
        } catch {
          // RPC indisponivel — salva sem codigo
        }
      }

      if (id || storedRef.current) {
        await updateLevantamento(toSave)
      } else {
        await createLevantamento(toSave)
        storedRef.current = toSave
      }
      setSaveStatus('saved')
    } catch {
      const stored = localStorage.getItem('riskflow_levantamentos')
      const list: Levantamento[] = stored ? JSON.parse(stored) : []
      const idx = list.findIndex(l => l.id === (id || toSave.id))
      if (idx >= 0) list[idx] = toSave
      else list.push(toSave)
      localStorage.setItem('riskflow_levantamentos', JSON.stringify(list))
      setSaveStatus('saved')
    }
  }, [id])

  const salvarRascunho = useCallback(async () => {
    const updated = { ...levantamento, updatedAt: new Date().toISOString().split('T')[0] }
    setLevantamento(updated)

    const vazio = !hasDraftContent(updated)
    if (vazio && !id && !storedRef.current) {
      if (hasInteracted.current) {
        toasts.addToast('info', 'Nada a salvar', 'Preencha os dados do levantamento para salvar.')
      }
      return
    }

    await executarSave(updated)
    if (hasInteracted.current) {
      toasts.addToast('success', 'Rascunho salvo', 'O levantamento foi salvo com sucesso.')
    }
  }, [levantamento, id, toasts, executarSave])

  const updateData = useCallback((partial: Partial<Levantamento>) => {
    hasInteracted.current = true
    setLevantamento(prev => {
      const updated = { ...prev, ...partial }
      updated.percentual = calcularPercentual(updated)
      return updated
    })
    setSaveStatus('idle')
  }, [])

  useEffect(() => {
    if (id) {
      getLevantamento(id).then(data => {
        if (data) {
          storedRef.current = data
          setLevantamento(data)
        }
      }).catch(() => {
        const stored = localStorage.getItem('riskflow_levantamentos')
        if (stored) {
          try {
            const list: Levantamento[] = JSON.parse(stored)
            const found = list.find(l => l.id === id)
            if (found) {
              storedRef.current = found
              setLevantamento(found)
            }
          } catch { /* ignore */ }
        }
      })
    }
  }, [id])

  useEffect(() => {
    if (!hasInteracted.current) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      const updated = { ...levantamento, updatedAt: today() }
      const vazio = !hasDraftContent(updated)
      if (!vazio || id || storedRef.current) {
        executarSave(updated)
      }
    }, 3000)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [levantamento, id, executarSave])

  const handleNext = useCallback(() => {
    salvarRascunho()
    setCurrentStep(s => Math.min(s + 1, 7))
  }, [salvarRascunho])

  const handleBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0))
  }, [])

  const finalizar = useCallback(async () => {
    let toSave = { ...levantamento }

    if (!toSave.codigo) {
      try {
        const codigo = await gerarCodigoDocumento(toSave.tipo)
        toSave = { ...toSave, codigo }
      } catch {
        // RPC indisponivel — finaliza sem codigo
      }
    }

    toSave = {
      ...toSave,
      status: STATUS_LEVANTAMENTO.CONCLUIDO,
      percentual: 100,
      updatedAt: today(),
    }
    setLevantamento(toSave)
    try {
      await updateLevantamento(toSave)
    } catch {
      const stored = localStorage.getItem('riskflow_levantamentos')
      const list: Levantamento[] = stored ? JSON.parse(stored) : []
      const idx = list.findIndex(l => l.id === toSave.id)
      if (idx >= 0) list[idx] = toSave
      else list.push(toSave)
      localStorage.setItem('riskflow_levantamentos', JSON.stringify(list))
    }
  }, [levantamento])

  return {
    levantamento,
    currentStep,
    progresso: levantamento.percentual,
    saveStatus,
    handleNext,
    handleBack,
    updateData,
    salvarRascunho,
    finalizar,
  }
}
