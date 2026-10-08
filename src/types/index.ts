export type TipoTransacao = 'entrada' | 'saida';

export type StatusTransacao = 'pago' | 'pendente' | 'recebido';

export type FormaPagamento = 
  | 'pix' 
  | 'dinheiro' 
  | 'cartao_debito' 
  | 'cartao_credito' 
  | 'transferencia' 
  | 'ifood' 
  | 'outro';

export interface Categoria {
  id: string;
  user_id: string;
  nome: string;
  tipo: TipoTransacao;
  cor?: string;
  icone?: string;
  created_at?: string;
}

export interface Lancamento {
  id: string;
  user_id: string;
  tipo: TipoTransacao;
  valor: number;
  data: string; // YYYY-MM-DD
  descricao?: string;
  origem: string;
  categoria_id?: string;
  categoria?: Categoria;
  forma_pagamento?: FormaPagamento;
  status: StatusTransacao;
  recorrente?: boolean;
  observacao?: string;
  created_at?: string;
}

export interface Meta {
  id: string;
  user_id: string;
  mes: string; // YYYY-MM-01
  meta_faturamento: number;
  limite_gastos: number;
  created_at?: string;
}

export interface Produto {
  id: string;
  user_id: string;
  nome: string;
  custo_ingredientes: number;
  preco_venda: number;
  margem_lucro_pct?: number;
  categoria?: string;
  ativo?: boolean;
  created_at?: string;
}

export type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'ano' | 'personalizado';

