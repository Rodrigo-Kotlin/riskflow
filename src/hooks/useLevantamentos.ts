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

  useEffect(() => { load() }, [load])

  const add = useCallback(async (levantamento: Levantamento) => {
    try {
      const created = await createLevantamento(levantamento)
      setLevantamentos(prev => [created, ...prev])
    } catch {
      setLevantamentos(prev => [...prev, levantamento])
    }
  }, [])

  const update = useCallback(async (levantamento: Levantamento) => {
    try {
      const updated = await updateLevantamento(levantamento)
      setLevantamentos(prev => prev.map(l => l.id === updated.id ? updated : l))
    } catch {
      setLevantamentos(prev => prev.map(l => l.id === levantamento.id ? levantamento : l))
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteLevantamento(id)
      setLevantamentos(prev => prev.filter(l => l.id !== id))
    } catch {
      setLevantamentos(prev => prev.filter(l => l.id !== id))
    }
  }, [])

  return { levantamentos, loading, error, add, update, remove, reload: load }
}
