import { createContext, useContext } from 'react'
import { useToast } from '@/hooks/useToast'
import { Usuario } from '@/types'

export interface AppContextType {
  user: Usuario | null
  setUser: (u: Usuario | null) => void
  toasts: ReturnType<typeof useToast>
  supabaseReady: boolean
  signOut: () => Promise<void>
}

export const AppContext = createContext<AppContextType>(null!)

export const useApp = () => useContext(AppContext)
