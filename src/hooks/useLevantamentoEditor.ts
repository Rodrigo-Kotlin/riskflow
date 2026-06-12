import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Levantamento } from '@/types'
import { useApp } from '@/components/layout/AppShell'
import { generateId, today } from '@/lib/utils'
import { STATUS_LEVANTAMENTO } from '@/constants'
import { createLevantamento, updateLevantamento, getLevantamento } from '@/services/supabase.service'

function criarRascunhoVazio(): Levantamento {
  return {
    id: generateId(),
    tipo: 'LPR',
    codigo: `LPR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    empresaId: '', empresaNome: '', cnpj: '', unidade: '', setor: '',
    responsavelEmpresa: '', auditorTecnico: '', registroMTE: '',
    dataLevantamento: today(), dataLancamentoSGG: '', responsavelLancamento: '',
    status: STATUS_LEVANTAMENTO.RASCUNHO, percentual: 0,
    caracteristicas: {
      setor: '', qtdColaboradores: 0, dimensoes: '', peDireito: '', pavimento: '',
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

function calcularPercentual(d: Levantamento): number {
  let total = 0
  if (d.empresaNome) total += 12.5
  if (d.caracteristicas.setor) total += 12.5
  if (d.medicoes.length > 0) total += 12.5
  if (d.colaboradores.length > 0) total += 12.5
  if (d.riscos.length > 0) total += 12.5
  if (d.controles.length > 0) total += 12.5
  if (d.parecer.texto) total += 12.5
  if (d.assinaturaTecnico.confirmada || d.assinaturaEmpresa.confirmada) total += 12.5
  return Math.round(total)
}

export function useLevantamentoEditor() {
  const { id } = useParams()
  const { toasts } = useApp()
  const [currentStep, setCurrentStep] = useState(0)
  const hasInteracted = useRef(false)
  const storedRef = useRef<Levantamento | null>(null)

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

  const salvarRascunho = useCallback(async () => {
    const updated = { ...levantamento, updatedAt: new Date().toISOString().split('T')[0] }
    setLevantamento(updated)
    try {
      if (id || storedRef.current) {
        await updateLevantamento(updated)
      } else {
        await createLevantamento(updated)
        storedRef.current = updated
      }
    } catch {
      const stored = localStorage.getItem('riskflow_levantamentos')
      const list: Levantamento[] = stored ? JSON.parse(stored) : []
      const idx = list.findIndex(l => l.id === updated.id)
      if (idx >= 0) list[idx] = updated
      else list.push(updated)
      localStorage.setItem('riskflow_levantamentos', JSON.stringify(list))
    }
    if (hasInteracted.current) {
      toasts.addToast('success', 'Rascunho salvo', 'O levantamento foi salvo automaticamente.')
    }
  }, [levantamento, id, toasts])

  const updateData = useCallback((partial: Partial<Levantamento>) => {
    hasInteracted.current = true
    setLevantamento(prev => {
      const updated = { ...prev, ...partial }
      updated.percentual = calcularPercentual(updated)
      return updated
    })
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
    salvarRascunho()
  }, [])

  const handleNext = useCallback(() => {
    salvarRascunho()
    setCurrentStep(s => Math.min(s + 1, 7))
  }, [salvarRascunho])

  const handleBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0))
  }, [])

  const finalizar = useCallback(async () => {
    const updated = { ...levantamento, status: STATUS_LEVANTAMENTO.CONCLUIDO, percentual: 100, updatedAt: today() }
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
    handleNext,
    handleBack,
    updateData,
    salvarRascunho,
    finalizar,
  }
}
