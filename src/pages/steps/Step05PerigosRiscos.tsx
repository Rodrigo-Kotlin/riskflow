import { useState, useEffect } from 'react'
import { Risco, RiscoCategoria, Levantamento } from '@/types'
import { generateId, calcularNivelRisco } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { InputField } from '@/components/forms/FormSection'
import { EmptyState } from '@/components/ui/EmptyState'
import { RiskCard } from '@/components/risk/RiskCard'
import { RiskTable } from '@/components/risk/RiskTable'
import { RiskDrawer } from '@/components/risk/RiskDrawer'
import { bibliotecaRiscos as initialRisksFallback } from '@/data/initialRisks'
import { buscarItensBiblioteca } from '@/services/biblioteca-tecnica.service'
import type { BibliotecaTecnicaItem } from '@/types'
import { Plus, Search, AlertTriangle, BookOpen } from 'lucide-react'
import { CATEGORIAS_PERIGO, NIVEIS_RISCO, SITUACAO_RISCO } from '@/constants'

const CATEGORIA_MAP: Record<string, RiscoCategoria> = {
  'Físico': 'Físicos',
  'Químico': 'Químicos',
  'Biológico': 'Biológicos',
  'Ergonômico': 'Ergonômicos',
  'Biomecânico': 'Biomecânicos',
  'Psicossocial': 'Psicossociais/Cognitivos',
  'Acidente': 'Acidentes/Mecânicos',
  'Acidente/Mecânico': 'Acidentes/Mecânicos',
  'Acidentes/Mecânicos': 'Acidentes/Mecânicos',
  'Mecânico': 'Acidentes/Mecânicos',
  'Organizacional': 'Organizacionais',
  'Ambiental': 'Ambientais',
}

function mapBibliotecaToRisco(item: BibliotecaTecnicaItem): Omit<Risco, 'id'> {
  return {
    categoria: CATEGORIA_MAP[item.tipo || ''] || 'Outros',
    perigo: item.nome,
    dano: item.descricao || '',
    severidade: 1,
    probabilidade: 1,
    pontuacao: 1,
    nivel: NIVEIS_RISCO.BAIXO,
    fonteGeradora: item.aplicacao || '',
    meioPropagacao: '',
    tempoExposicao: '',
    situacao: SITUACAO_RISCO.CONTROLADO,
    avaliacaoQuantitativa: false,
    situacaoEncontrada: '',
    controleFonte: '',
    controleTrajetoria: '',
    controleTrabalhador: '',
    evidencias: [],
    observacoes: '',
  }
}

interface Props {
  data: Levantamento
  updateData: (partial: Partial<Levantamento>) => void
}

const categorias: RiscoCategoria[] = [...CATEGORIAS_PERIGO]

const niveis = ['Todos', NIVEIS_RISCO.BAIXO, NIVEIS_RISCO.MODERADO, NIVEIS_RISCO.ALTO, NIVEIS_RISCO.CRITICO]

function emptyRisco(): Risco {
  return {
    id: generateId(), categoria: CATEGORIAS_PERIGO[7], perigo: '', dano: '',
    severidade: 1, probabilidade: 1, pontuacao: 1, nivel: NIVEIS_RISCO.BAIXO,
    fonteGeradora: '', meioPropagacao: '', tempoExposicao: '',
    situacao: SITUACAO_RISCO.CONTROLADO, avaliacaoQuantitativa: false,
    situacaoEncontrada: '', controleFonte: '', controleTrajetoria: '',
    controleTrabalhador: '', evidencias: [], observacoes: ''
  }
}

export function Step05PerigosRiscos({ data, updateData }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailRisco, setDetailRisco] = useState<Risco | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Risco>(emptyRisco())
  const [filterCat, setFilterCat] = useState<string>('Todas')
  const [filterNivel, setFilterNivel] = useState<string>('Todos')
  const [searchPerigo, setSearchPerigo] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)
  const [libraryItems, setLibraryItems] = useState<Omit<Risco, 'id'>[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLibraryLoading(true)
      try {
        const items = await buscarItensBiblioteca('risco')
        if (!cancelled) setLibraryItems(items.map(mapBibliotecaToRisco))
      } catch {
        if (!cancelled) setLibraryItems(initialRisksFallback)
      } finally {
        if (!cancelled) setLibraryLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const riscos: Risco[] = data.riscos || []

  const filtered = riscos.filter(r => {
    const matchCat = filterCat === 'Todas' || r.categoria === filterCat
    const matchNivel = filterNivel === 'Todos' || r.nivel === filterNivel
    const matchSearch = !searchPerigo || r.perigo.toLowerCase().includes(searchPerigo.toLowerCase())
    return matchCat && matchNivel && matchSearch
  })

  const openNew = () => {
    setForm(emptyRisco())
    setEditingId(null)
    setShowLibrary(true)
    setModalOpen(true)
  }

  const openEdit = (r: Risco) => {
    setForm({ ...r })
    setEditingId(r.id)
    setShowLibrary(false)
    setModalOpen(true)
  }

  const loadFromLibrary = (libRisco: Omit<Risco, 'id'>) => {
    setForm({ ...emptyRisco(), ...libRisco })
    setShowLibrary(false)
  }

  const save = () => {
    if (!form.perigo) return
    const { pontuacao, nivel } = calcularNivelRisco(form.severidade, form.probabilidade)
    const updated = { ...form, pontuacao, nivel }
    if (editingId) {
      updateData({ riscos: riscos.map((r: Risco) => r.id === editingId ? updated : r) })
    } else {
      updateData({ riscos: [...riscos, updated] })
    }
    setModalOpen(false)
  }

  const remove = (id: string) => {
    updateData({ riscos: riscos.filter((r: Risco) => r.id !== id) })
  }

  const duplicate = (r: Risco) => {
    updateData({ riscos: [...riscos, { ...r, id: generateId() }] })
  }

  const view = (r: Risco) => {
    setDetailRisco(r)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Inventário de Riscos ({riscos.length})</h3>
          <p className="text-xs text-text-secondary">Cadastre os perigos e riscos identificados no local</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1 h-9 px-4 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
          <Plus size={16} /> Adicionar Risco
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input id="risco-search" value={searchPerigo} onChange={(e) => setSearchPerigo(e.target.value)} placeholder="Buscar por agente/perigo..." className="w-full h-9 pl-8 pr-3 rounded-lg border border-border text-sm" />
        </div>
        <label htmlFor="risco-filterCat" className="sr-only">Filtrar por categoria</label>
        <select id="risco-filterCat" value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm bg-white">
          <option value="Todas">Categoria: Todas</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label htmlFor="risco-filterNivel" className="sr-only">Filtrar por nível</label>
        <select id="risco-filterNivel" value={filterNivel} onChange={(e) => setFilterNivel(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm bg-white">
          {niveis.map(n => <option key={n} value={n}>Nível: {n}</option>)}
        </select>
      </div>

      {riscos.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="inline-block w-3 h-3 rounded-full bg-risk-low" /> Baixo
          <span className="inline-block w-3 h-3 rounded-full bg-risk-moderate" /> Moderado
          <span className="inline-block w-3 h-3 rounded-full bg-risk-high" /> Alto
          <span className="inline-block w-3 h-3 rounded-full bg-risk-critical" /> Crítico
        </div>
      )}

      <RiskTable riscos={filtered} onEdit={(r) => openEdit(r)} onDelete={(id) => remove(id)} onDuplicate={duplicate} onView={view} />

      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon={<AlertTriangle size={32} />} title="Nenhum risco encontrado" description="Use o botão acima para adicionar riscos ao inventário." action={<button onClick={openNew} className="h-8 px-3 bg-brand-500 text-white text-xs font-medium rounded-lg">Adicionar Risco</button>} />
        ) : (
          filtered.map((r: Risco) => (
            <RiskCard key={r.id} risco={r} onEdit={() => openEdit(r)} onDelete={() => remove(r.id)} onDuplicate={() => duplicate(r)} onView={() => view(r)} />
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Risco' : 'Adicionar Risco'} size="xl">
        {showLibrary && !editingId && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-text-secondary" />
              <p className="text-xs font-medium text-text-secondary">
                {libraryLoading ? 'Carregando biblioteca técnica...' : 'Selecione um risco da biblioteca técnica:'}
              </p>
            </div>
            {libraryLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {libraryItems.map((r, i) => (
                  <button key={i} onClick={() => loadFromLibrary(r)} className="text-left p-2 border border-border rounded-lg hover:border-brand-500 hover:bg-brand-50 text-xs">
                    <span className="font-medium text-text-primary">{r.perigo}</span>
                    <span className="font-medium text-text-secondary ml-2">{r.categoria}</span>
                    {r.dano && <span className="text-text-secondary block">{r.dano}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField label="Categoria" required inputId="risco-categoria">
            <select id="risco-categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as RiscoCategoria })} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-white">
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </InputField>
          <InputField label="Perigo/Agente" required inputId="risco-perigo">
            <input id="risco-perigo" value={form.perigo} onChange={(e) => setForm({ ...form, perigo: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Dano ou Potencial Efeito" className="md:col-span-2" inputId="risco-dano">
            <textarea id="risco-dano" value={form.dano} onChange={(e) => setForm({ ...form, dano: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Severidade (1-5)" inputId="risco-severidade">
            <input id="risco-severidade" type="number" min={1} max={5} value={form.severidade} onChange={(e) => setForm({ ...form, severidade: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Probabilidade (1-5)" inputId="risco-probabilidade">
            <input id="risco-probabilidade" type="number" min={1} max={5} value={form.probabilidade} onChange={(e) => setForm({ ...form, probabilidade: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Pontuação / Nível" inputId="risco-pontuacao">
            <input id="risco-pontuacao" value={`${form.severidade * form.probabilidade} — ${calcularNivelRisco(form.severidade, form.probabilidade).nivel}`} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-gray-50 font-bold" readOnly />
          </InputField>
          <InputField label="Situação do Risco" inputId="risco-situacao">
            <select id="risco-situacao" value={form.situacao} onChange={(e) => setForm({ ...form, situacao: e.target.value as Risco['situacao'] })} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-white">
              <option value={SITUACAO_RISCO.CONTROLADO}>{SITUACAO_RISCO.CONTROLADO}</option>
              <option value={SITUACAO_RISCO.CONTROLE_INSUFICIENTE}>{SITUACAO_RISCO.CONTROLE_INSUFICIENTE}</option>
              <option value={SITUACAO_RISCO.NAO_CONTROLADO}>{SITUACAO_RISCO.NAO_CONTROLADO}</option>
              <option value={SITUACAO_RISCO.NAO_APLICAVEL}>{SITUACAO_RISCO.NAO_APLICAVEL}</option>
            </select>
          </InputField>
          <InputField label="Avaliação Quantitativa" inputId="risco-avaliacaoQuantitativa">
            <select id="risco-avaliacaoQuantitativa" value={form.avaliacaoQuantitativa ? 'sim' : 'nao'} onChange={(e) => setForm({ ...form, avaliacaoQuantitativa: e.target.value === 'sim' })} className="w-full h-9 px-3 rounded-lg border border-border text-sm bg-white">
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </InputField>
          <InputField label="Fonte Geradora" className="md:col-span-2" inputId="risco-fonteGeradora">
            <textarea id="risco-fonteGeradora" value={form.fonteGeradora} onChange={(e) => setForm({ ...form, fonteGeradora: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Meio de Propagação/Trajetória" inputId="risco-meioPropagacao">
            <input id="risco-meioPropagacao" value={form.meioPropagacao} onChange={(e) => setForm({ ...form, meioPropagacao: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Tempo de Exposição" inputId="risco-tempoExposicao">
            <input id="risco-tempoExposicao" value={form.tempoExposicao} onChange={(e) => setForm({ ...form, tempoExposicao: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Situação de Perigo/Risco Encontrada" className="md:col-span-2" inputId="risco-situacaoEncontrada">
            <textarea id="risco-situacaoEncontrada" value={form.situacaoEncontrada} onChange={(e) => setForm({ ...form, situacaoEncontrada: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Controle na Fonte" className="md:col-span-2" inputId="risco-controleFonte">
            <textarea id="risco-controleFonte" value={form.controleFonte} onChange={(e) => setForm({ ...form, controleFonte: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Controle na Trajetória" inputId="risco-controleTrajetoria">
            <textarea id="risco-controleTrajetoria" value={form.controleTrajetoria} onChange={(e) => setForm({ ...form, controleTrajetoria: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Controle no Trabalhador" inputId="risco-controleTrabalhador">
            <textarea id="risco-controleTrabalhador" value={form.controleTrabalhador} onChange={(e) => setForm({ ...form, controleTrabalhador: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
          <InputField label="Observações Técnicas" className="md:col-span-2" inputId="risco-observacoes">
            <textarea id="risco-observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </InputField>
        </div>
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-border">
          <button onClick={() => setModalOpen(false)} className="px-3 h-9 text-sm text-text-secondary bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={save} className="px-3 h-9 bg-brand-500 text-white text-sm font-medium rounded-lg">Salvar Risco</button>
        </div>
      </Modal>

      <RiskDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} risco={detailRisco} />
    </div>
  )
}
