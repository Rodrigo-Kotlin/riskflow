import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import { bibliotecaRiscos } from '@/data/initialRisks'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

const secoes = [
  { id: 'riscos', label: 'Riscos/Agentes' },
  { id: 'epis', label: 'EPIs' },
  { id: 'epcs', label: 'EPCs' },
  { id: 'equipamentos', label: 'Equipamentos de Medição' },
  { id: 'pareceres', label: 'Modelos de Parecer' },
]

export function Biblioteca() {
  const [secao, setSecao] = useState('riscos')
  const [search, setSearch] = useState('')

  const filtered = bibliotecaRiscos.filter(r =>
    !search || r.perigo.toLowerCase().includes(search.toLowerCase()) || r.categoria.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Biblioteca Técnica</h1>
        <p className="text-sm text-text-secondary">Consultar riscos, agentes, EPIs e modelos de parecer</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {secoes.map(s => (
          <button key={s.id} onClick={() => setSecao(s.id)}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${secao === s.id ? 'bg-brand-500 text-white' : 'bg-white border border-border text-text-secondary hover:bg-gray-50'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar na biblioteca..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70" />
      </div>

      {secao === 'riscos' && (
        <>
          {filtered.length === 0 ? (
            <EmptyState icon={<BookOpen size={32} />} title="Nenhum risco encontrado" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-brand-200 transition-colors">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="info">{r.categoria}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary">{r.perigo}</h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{r.dano}</p>
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-[10px] text-text-secondary"><span className="font-medium">Fonte:</span> {r.fonteGeradora}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5"><span className="font-medium">Controle:</span> {r.controleFonte}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {secao !== 'riscos' && (
        <EmptyState icon={<BookOpen size={40} />} title="Seção em desenvolvimento" description="Esta seção da biblioteca técnica está sendo preparada para edição." />
      )}
    </div>
  )
}
