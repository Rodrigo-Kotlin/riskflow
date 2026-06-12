import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff size={16} />
      <span>Você está trabalhando offline. Os dados serão sincronizados posteriormente.</span>
    </div>
  )
}
