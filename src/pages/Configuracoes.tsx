import { useState } from 'react'
import { Moon, Sun, Download, Upload, Trash2, Shield } from 'lucide-react'
import { useApp } from '@/components/layout/AppShell'
import { exportData, importData, clearAllData } from '@/lib/storage'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormSection } from '@/components/forms/FormSection'

export function Configuracoes() {
  const { user, toasts } = useApp()
  const [darkMode, setDarkMode] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `riskflow-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toasts.addToast('success', 'Exportado', 'Backup dos dados exportado com sucesso.')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: Event) => {
      try {
        const target = e.target as HTMLInputElement;
        if (!target.files?.length) return;
        const file = target.files[0]
        const text = await file.text()
        const data = JSON.parse(text)
        importData(data)
        toasts.addToast('success', 'Importado', 'Dados importados com sucesso. Atualize a página.')
      } catch {
        toasts.addToast('error', 'Erro', 'Falha ao importar o arquivo.')
      }
    }
    input.click()
  }

  const handleClearDemo = () => {
    clearAllData()
    toasts.addToast('success', 'Limpo', 'Dados de demonstração removidos. Atualize a página.')
    setShowClearConfirm(false)
  }

  const toggleDark = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Configurações</h1>
        <p className="text-sm text-text-secondary">Preferências do sistema e gerenciamento de dados</p>
      </div>

      <div className="space-y-4">
        <FormSection title="Preferências do Sistema">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-text-primary" /> : <Sun size={20} className="text-text-primary" />}
              <div>
                <p className="text-sm font-medium text-text-primary">Modo escuro</p>
                <p className="text-xs text-text-secondary">Alternar entre tema claro e escuro</p>
              </div>
            </div>
            <button
              onClick={toggleDark}
              className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-brand-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </FormSection>

        <FormSection title="Perfil do Usuário">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{user?.nome || 'Usuário'}</p>
                <p className="text-xs text-text-secondary">{user?.email || 'Não informado'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-text-secondary">
              <span>Perfil: {user ? { admin: 'Administrador', tecnico: 'Técnico', visualizador: 'Visualizador' }[user.perfil] : '—'}</span>
              <span>Registro profissional: Em breve</span>
            </div>
          </div>
        </FormSection>

        <FormSection title="Usuários e Perfis" collapsible defaultOpen={false}>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{user.nome}</p>
                  <p className="text-xs text-text-secondary">{user.email} — {{ admin: 'Administrador', tecnico: 'Técnico', visualizador: 'Visualizador' }[user.perfil]}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-brand-100 text-brand-500 rounded-full font-medium capitalize">{{ admin: 'Admin', tecnico: 'Técnico', visualizador: 'Visualizador' }[user.perfil]}</span>
              </div>
              <p className="text-xs text-text-secondary text-center pt-3 border-t border-border">
                A gestão de usuários estará disponível em uma próxima versão.
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Nenhum usuário autenticado.</p>
          )}
        </FormSection>

        <FormSection title="Backup e Exportação de Dados">
          <div className="flex flex-col md:flex-row gap-3">
            <button onClick={handleExport} className="flex items-center justify-center gap-2 h-10 px-4 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
              <Download size={16} /> Exportar Backup
            </button>
            <button onClick={handleImport} className="flex items-center justify-center gap-2 h-10 px-4 border border-border text-text-secondary text-sm font-medium rounded-lg hover:bg-gray-50">
              <Upload size={16} /> Importar Backup
            </button>
          </div>
        </FormSection>

        <FormSection title="Limpar Dados">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Trash2 size={20} className="text-risk-high shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-risk-high">Limpar dados de demonstração</p>
                <p className="text-xs text-red-700 mt-1">Remove todos os dados salvos localmente, mantendo apenas usuário e preferências. Esta ação não pode ser desfeita.</p>
                <button onClick={() => setShowClearConfirm(true)} className="mt-2 h-8 px-3 bg-risk-high text-white text-xs font-medium rounded-lg hover:bg-red-700">
                  Limpar Dados
                </button>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearDemo}
        title="Limpar todos os dados?"
        message="Todos os dados salvos serão removidos permanentemente. Os dados de usuário e preferências serão mantidos."
        confirmText="Limpar Tudo"
        variant="danger"
      />
    </div>
  )
}
