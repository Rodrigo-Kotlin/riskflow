import { useState, useEffect, useCallback } from 'react'
import type { Empresa } from '@/types'
import { listEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from '@/services/supabase.service'
import { empresasMock } from '@/data/mock'

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listEmpresas()
      setEmpresas(data)
    } catch {
      const stored = localStorage.getItem('riskflow_empresas')
      if (stored) {
        try { setEmpresas(JSON.parse(stored)) } catch { setEmpresas(empresasMock) }
      } else {
        setEmpresas(empresasMock)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (empresa: Empresa) => {
    try {
      const created = await createEmpresa(empresa)
      setEmpresas(prev => [created, ...prev])
    } catch {
      setEmpresas(prev => [...prev, empresa])
      localStorage.setItem('riskflow_empresas', JSON.stringify([...empresas, empresa]))
    }
  }, [empresas])

  const update = useCallback(async (empresa: Empresa) => {
    try {
      const updated = await updateEmpresa(empresa)
      setEmpresas(prev => prev.map(e => e.id === updated.id ? updated : e))
    } catch {
      setEmpresas(prev => prev.map(e => e.id === empresa.id ? empresa : e))
      localStorage.setItem('riskflow_empresas', JSON.stringify(empresas.map(e => e.id === empresa.id ? empresa : e)))
    }
  }, [empresas])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteEmpresa(id)
      setEmpresas(prev => prev.filter(e => e.id !== id))
    } catch {
      setEmpresas(prev => prev.filter(e => e.id !== id))
      localStorage.setItem('riskflow_empresas', JSON.stringify(empresas.filter(e => e.id !== id)))
    }
  }, [empresas])

  return { empresas, loading, error, add, update, remove, reload: load }
}
