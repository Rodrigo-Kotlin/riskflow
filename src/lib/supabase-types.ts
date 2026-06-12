export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string
          email: string | null
          perfil: 'admin' | 'tecnico' | 'visualizador'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          nome: string
          email?: string | null
          perfil?: 'admin' | 'tecnico' | 'visualizador'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          perfil?: 'admin' | 'tecnico' | 'visualizador'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      empresas: {
        Row: {
          id: string
          razao_social: string
          nome_fantasia: string
          cnpj: string
          cnae: string
          grau_risco: string
          endereco: string
          cidade: string
          uf: string
          responsavel: string
          telefone: string
          email: string
          observacoes: string
          created_at: string | null
          user_id: string | null
        }
        Insert: {
          id: string
          razao_social: string
          nome_fantasia?: string
          cnpj?: string
          cnae?: string
          grau_risco?: string
          endereco?: string
          cidade?: string
          uf?: string
          responsavel?: string
          telefone?: string
          email?: string
          observacoes?: string
          created_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          razao_social?: string
          nome_fantasia?: string
          cnpj?: string
          cnae?: string
          grau_risco?: string
          endereco?: string
          cidade?: string
          uf?: string
          responsavel?: string
          telefone?: string
          email?: string
          observacoes?: string
          created_at?: string | null
          user_id?: string | null
        }
      }
      levantamentos: {
        Row: {
          id: string
          tipo: string
          codigo: string
          empresa_id: string | null
          empresa_nome: string
          cnpj: string
          unidade: string
          setor: string
          responsavel_empresa: string
          auditor_tecnico: string
          registro_mte: string
          data_levantamento: string | null
          data_lancamento_sgg: string
          responsavel_lancamento: string
          status: string
          percentual: number
          caracteristicas: Json
          medicoes: Json
          colaboradores: Json
          riscos: Json
          controles: Json
          parecer: Json
          assinatura_tecnico: Json
          assinatura_empresa: Json
          created_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id: string
          tipo: string
          codigo: string
          empresa_id?: string | null
          empresa_nome?: string
          cnpj?: string
          unidade?: string
          setor?: string
          responsavel_empresa?: string
          auditor_tecnico?: string
          registro_mte?: string
          data_levantamento?: string | null
          data_lancamento_sgg?: string
          responsavel_lancamento?: string
          status?: string
          percentual?: number
          caracteristicas?: Json
          medicoes?: Json
          colaboradores?: Json
          riscos?: Json
          controles?: Json
          parecer?: Json
          assinatura_tecnico?: Json
          assinatura_empresa?: Json
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          tipo?: string
          codigo?: string
          empresa_id?: string | null
          empresa_nome?: string
          cnpj?: string
          unidade?: string
          setor?: string
          responsavel_empresa?: string
          auditor_tecnico?: string
          registro_mte?: string
          data_levantamento?: string | null
          data_lancamento_sgg?: string
          responsavel_lancamento?: string
          status?: string
          percentual?: number
          caracteristicas?: Json
          medicoes?: Json
          colaboradores?: Json
          riscos?: Json
          controles?: Json
          parecer?: Json
          assinatura_tecnico?: Json
          assinatura_empresa?: Json
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
      relatorios: {
        Row: {
          id: string
          levantamento_id: string | null
          empresa_nome: string
          tipo: string
          data: string
          modelo: string
          status: string
          created_at: string | null
          user_id: string | null
        }
        Insert: {
          id: string
          levantamento_id?: string | null
          empresa_nome?: string
          tipo?: string
          data?: string
          modelo?: string
          status?: string
          created_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          levantamento_id?: string | null
          empresa_nome?: string
          tipo?: string
          data?: string
          modelo?: string
          status?: string
          created_at?: string | null
          user_id?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
