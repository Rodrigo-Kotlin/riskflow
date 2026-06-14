import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Levantamento } from '@/types'
import { useApp } from '@/components/layout/AppShell'
import { generateId, today } from '@/lib/utils'
import { STATUS_LEVANTAMENTO } from '@/constants'
import { createLevantamento, updateLevantamento, getLevantamento } from '@/services/supabase.service'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function gerarCodigo(tipo: string): string {
  const ano = new Date().getFullYear() % 100
  const anoStr = String(ano).padStart(2, '0')
  const stored = localStorage.getItem('riskflow_levantamentos')
  let maxSeq = 0
  if (stored) {
    try {
      const list: Levantamento[] = JSON.parse(stored)
      for (const l of list) {
        const match = l.codigo?.match(/(\d{4})\/\d{2}$/)
        if (match) {
          const seq = parseInt(match[1], 10)
          if (seq > maxSeq) maxSeq = seq
        }
      }
    } catch { /* ignore */ }
  }
  const seq = String(maxSeq + 1).padStart(4, '0')
  return `${tipo}-${seq}/${anoStr}`
}

function criarRascunhoVazio(): Levantamento {
  return {
    id: generateId(),
    tipo: 'LPR',
    codigo: gerarCodigo('LPR'),
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
    try {
      if (id || storedRef.current) {
        await updateLevantamento(updated)
      } else {
        await createLevantamento(updated)
        storedRef.current = updated
      }
      setSaveStatus('saved')
    } catch {
      const stored = localStorage.getItem('riskflow_levantamentos')
      const list: Levantamento[] = stored ? JSON.parse(stored) : []
      const idx = list.findIndex(l => l.id === updated.id)
      if (idx >= 0) list[idx] = updated
      else list.push(updated)
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
      if (partial.tipo && partial.tipo !== prev.tipo && !id && !prev.empresaId) {
        updated.codigo = gerarCodigo(partial.tipo)
      }
      updated.percentual = calcularPercentual(updated)
      return updated
    })
    setSaveStatus('idle')
  }, [id])

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
    const updated = {
      ...levantamento,
      status: STATUS_LEVANTAMENTO.CONCLUIDO,
      percentual: 100,
      updatedAt: today(),
    }
    setLevantamento(updated)
    try {
      await updateLevantamento(updated)
    } catch {
      const stored = localStorage.getItem('riskflow_levantamentos')
      const list: Levantamento[] = stored ? JSON.parse(stored) : []
      const idx = list.findIndex(l => l.id === updated.id)
      if (idx >= 0) list[idx] = updated
      else list.push(updated)
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
