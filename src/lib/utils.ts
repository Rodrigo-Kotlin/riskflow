export function formatDate(date: string): string {
  if (!date) return ''
  // YYYY-MM-DD (date-only) → treat as local date to avoid timezone shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR')
  }
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string): string {
  if (!date) return ''
  // YYYY-MM-DD (date-only) → treat as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleString('pt-BR')
  }
  return new Date(date).toLocaleString('pt-BR')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

import { NIVEIS_RISCO } from '@/constants'

export function calcularNivelRisco(severidade: number, probabilidade: number): { pontuacao: number; nivel: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico' } {
  const pontuacao = severidade * probabilidade
  let nivel: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico'
  if (pontuacao <= 4) nivel = NIVEIS_RISCO.BAIXO
  else if (pontuacao <= 9) nivel = NIVEIS_RISCO.MODERADO
  else if (pontuacao <= 16) nivel = NIVEIS_RISCO.ALTO
  else nivel = NIVEIS_RISCO.CRITICO
  return { pontuacao, nivel }
}

export function getNivelCor(nivel: string): string {
  switch (nivel) {
    case NIVEIS_RISCO.BAIXO: return 'bg-risk-low'
    case NIVEIS_RISCO.MODERADO: return 'bg-risk-moderate'
    case NIVEIS_RISCO.ALTO: return 'bg-risk-high'
    case NIVEIS_RISCO.CRITICO: return 'bg-risk-critical'
    default: return 'bg-text-secondary'
  }
}

export function getNivelTextoCor(nivel: string): string {
  switch (nivel) {
    case NIVEIS_RISCO.BAIXO: return 'text-risk-low'
    case NIVEIS_RISCO.MODERADO: return 'text-risk-moderate'
    case NIVEIS_RISCO.ALTO: return 'text-risk-high'
    case NIVEIS_RISCO.CRITICO: return 'text-red-900'
    default: return 'text-text-secondary'
  }
}

export function getNivelBgClaro(nivel: string): string {
  switch (nivel) {
    case NIVEIS_RISCO.BAIXO: return 'bg-green-50 text-green-700 border-green-200'
    case NIVEIS_RISCO.MODERADO: return 'bg-amber-50 text-amber-700 border-amber-200'
    case NIVEIS_RISCO.ALTO: return 'bg-red-50 text-red-700 border-red-200'
    case NIVEIS_RISCO.CRITICO: return 'bg-red-100 text-red-900 border-red-300'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}
