import { useState, useEffect, useCallback } from 'react'
import type { Levantamento } from '@/types'
import { listLevantamentos, createLevantamento, updateLevantamento, deleteLevantamento } from '@/services/supabase.service'

export function useLevantamentos() {
  const [levantamentos, setLevantamentos] = useState<Levantamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listLevantamentos()
      setLevantamentos(data)
    } catch {
      const stored = localStorage.getItem('riskflow_levantamentos')
      if (stored) {
        try { setLevantamentos(JSON.parse(stored)) } catch { setLevantamentos([]) }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const add = useCallback(async (levantamento: Levantamento) => {
    try {
      const created = await createLevantamento(levantamento)
      setLevantamentos(prev => [created, ...prev])
    } catch (err) {
      if (import.meta.env.DEV) console.error('[useLevantamentos] Erro ao criar:', err)
      setLevantamentos(prev => [...prev, levantamento])
    }
  }, [])

  const update = useCallback(async (levantamento: Levantamento) => {
    try {
      const updated = await updateLevantamento(levantamento)
      setLevantamentos(prev => prev.map(l => l.id === updated.id ? updated : l))
    } catch (err) {
      if (import.meta.env.DEV) console.error('[useLevantamentos] Erro ao atualizar:', err)
      setLevantamentos(prev => prev.map(l => l.id === levantamento.id ? levantamento : l))
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteLevantamento(id)
      setLevantamentos(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      const logData: Record<string, unknown> = { operation: 'delete', entity: 'levantamento', id }
      if (err instanceof Object) {
        const e = err as Record<string, unknown>
        logData.code = e?.code; logData.message = e?.message; logData.details = e?.details; logData.hint = e?.hint
      }
      if (import.meta.env.DEV) console.error('[useLevantamentos] Erro ao excluir levantamento:', logData)
      throw err
    }
  }, [])

  return { levantamentos, loading, error, add, update, remove, reload: load }
}
