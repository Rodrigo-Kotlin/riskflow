import { Empresa, Usuario } from '@/types'

export const usuariosMock: Usuario[] = [
  { id: 'u1', nome: 'Carlos Silva', email: 'carlos@efetiva.com', senha: 'riskflow', perfil: 'admin' },
  { id: 'u2', nome: 'Ana Oliveira', email: 'ana@efetiva.com', senha: 'riskflow', perfil: 'tecnico' },
  { id: 'u3', nome: 'Pedro Santos', email: 'pedro@efetiva.com', senha: 'riskflow', perfil: 'visualizador' },
]

export const empresasMock: Empresa[] = [
  {
    id: 'e1', razaoSocial: 'Metalúrgica ABC Ltda', nomeFantasia: 'Metal ABC',
    cnpj: '12.345.678/0001-90', cnae: '24.31-2', grauRisco: '3',
    endereco: 'Av. Industrial, 1500', cidade: 'São Paulo', uf: 'SP',
    responsavel: 'João Ferreira', telefone: '(11) 3456-7890', email: 'joao@metalabc.com.br',
    observacoes: 'Indústria de médio porte, 200 colaboradores', createdAt: '2025-01-15'
  },
  {
    id: 'e2', razaoSocial: 'Construtora Nova Era Ltda', nomeFantasia: 'Nova Era',
    cnpj: '23.456.789/0001-01', cnae: '41.20-6', grauRisco: '4',
    endereco: 'Rua dos Engenheiros, 500', cidade: 'Campinas', uf: 'SP',
    responsavel: 'Maria Costa', telefone: '(19) 3456-7891', email: 'maria@novaera.com.br',
    observacoes: 'Obras em andamento em 3 frentes de trabalho', createdAt: '2025-02-20'
  },
  {
    id: 'e3', razaoSocial: 'Indústria Química Sul Ltda', nomeFantasia: 'Química Sul',
    cnpj: '34.567.890/0001-12', cnae: '20.11-4', grauRisco: '4',
    endereco: 'Rodovia BR-101, km 45', cidade: 'Porto Alegre', uf: 'RS',
    responsavel: 'Roberto Almeida', telefone: '(51) 3456-7892', email: 'roberto@quimicasul.com.br',
    observacoes: 'Produtos químicos perigosos, PGR vigente', createdAt: '2025-03-10'
  },
  {
    id: 'e4', razaoSocial: 'Supermercado Bom Preço S.A.', nomeFantasia: 'Bom Preço',
    cnpj: '45.678.901/0001-23', cnae: '47.11-3', grauRisco: '2',
    endereco: 'Rua das Flores, 200', cidade: 'Belo Horizonte', uf: 'MG',
    responsavel: 'Lucia Martins', telefone: '(31) 3456-7893', email: 'lucia@bompreco.com.br',
    observacoes: 'Rede com 5 lojas, 600 colaboradores no total', createdAt: '2025-04-05'
  },
  {
    id: 'e5', razaoSocial: 'Hospital São Lucas Ltda', nomeFantasia: 'Hospital São Lucas',
    cnpj: '56.789.012/0001-34', cnae: '86.10-1', grauRisco: '3',
    endereco: 'Av. da Saúde, 1000', cidade: 'Curitiba', uf: 'PR',
    responsavel: 'Dr. Paulo Mendes', telefone: '(41) 3456-7894', email: 'paulo@hospitalsaolucas.com.br',
    observacoes: 'Hospital geral, 300 leitos, 800 colaboradores', createdAt: '2025-05-12'
  },
]


