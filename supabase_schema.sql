-- ==============================================================================
-- SISTEMA DE CONTROLE FINANCEIRO "DOCES DA LUANA"
-- Script SQL Completo de Criação das Tabelas, RLS, Políticas, Índices e Seed
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela: CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  cor text DEFAULT '#8E8E93',
  icone text DEFAULT 'tag',
  created_at timestamptz DEFAULT now()
);

-- 3. Tabela: LANÇAMENTOS
CREATE TABLE IF NOT EXISTS public.lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor numeric(12,2) NOT NULL CHECK (valor > 0),
  data date NOT NULL DEFAULT current_date,
  descricao text,
  origem text NOT NULL,                -- Ex.: 'Balcão', 'Encomenda', 'iFood', 'Fornecedor X', 'Mercado'
  categoria_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL,
  forma_pagamento text,                -- 'pix', 'dinheiro', 'cartao_debito', 'cartao_credito', 'transferencia', 'outro'
  status text DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'recebido')),
  recorrente boolean DEFAULT false,
  observacao text,
  created_at timestamptz DEFAULT now()
);

-- 4. Tabela: METAS MENSAIS
CREATE TABLE IF NOT EXISTS public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  mes date NOT NULL,                   -- primeiro dia do mês correspondente (ex: 2026-10-01)
  meta_faturamento numeric(12,2) DEFAULT 0,
  limite_gastos numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_metas_user_mes UNIQUE (user_id, mes)
);

-- 5. Tabela: PRODUTOS / CARDÁPIO (Ficha técnica básica & margem de lucro)
CREATE TABLE IF NOT EXISTS public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  custo_ingredientes numeric(12,2) NOT NULL DEFAULT 0,
  preco_venda numeric(12,2) NOT NULL DEFAULT 0,
  margem_lucro_pct numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN preco_venda > 0 THEN ((preco_venda - custo_ingredientes) / preco_venda) * 100 
      ELSE 0 
    END
  ) STORED,
  categoria text DEFAULT 'Doces',
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 6. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_lancamentos_user_data ON public.lancamentos (user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON public.lancamentos (user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON public.lancamentos (user_id, status);
CREATE INDEX IF NOT EXISTS idx_categorias_user ON public.categorias (user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_metas_user_mes ON public.metas (user_id, mes);
CREATE INDEX IF NOT EXISTS idx_produtos_user ON public.produtos (user_id);

-- ==============================================================================
-- 7. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para CATEGORIAS
DROP POLICY IF EXISTS "Categorias acessíveis pelo proprietário" ON public.categorias;
CREATE POLICY "Categorias acessíveis pelo proprietário"
  ON public.categorias
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de RLS para LANÇAMENTOS
DROP POLICY IF EXISTS "Lançamentos acessíveis pelo proprietário" ON public.lancamentos;
CREATE POLICY "Lançamentos acessíveis pelo proprietário"
  ON public.lancamentos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de RLS para METAS
DROP POLICY IF EXISTS "Metas acessíveis pelo proprietário" ON public.metas;
CREATE POLICY "Metas acessíveis pelo proprietário"
  ON public.metas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de RLS para PRODUTOS
DROP POLICY IF EXISTS "Produtos acessíveis pelo proprietário" ON public.produtos;
CREATE POLICY "Produtos acessíveis pelo proprietário"
  ON public.produtos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 8. FUNÇÃO & TRIGGER PARA SEED DE CATEGORIAS PADRÃO PARA NOVOS USUÁRIOS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Categorias de ENTRADA padrão
  INSERT INTO public.categorias (user_id, nome, tipo, cor, icone) VALUES
    (NEW.id, 'Vendas no Balcão', 'entrada', '#34C759', 'store'),
    (NEW.id, 'Encomendas', 'entrada', '#FF2D55', 'cake'),
    (NEW.id, 'iFood / Delivery', 'entrada', '#FF9500', 'bike'),
    (NEW.id, 'WhatsApp / Direct', 'entrada', '#30D158', 'message-circle'),
    (NEW.id, 'Eventos & Festas', 'entrada', '#AF52DE', 'party-popper'),
    (NEW.id, 'Revenda / Parceiros', 'entrada', '#007AFF', 'briefcase'),
    (NEW.id, 'Outras Entradas', 'entrada', '#8E8E93', 'dollar-sign');

  -- Categorias de SAÍDA padrão para confeitaria/doceria
  INSERT INTO public.categorias (user_id, nome, tipo, cor, icone) VALUES
    (NEW.id, 'Ingredientes & Insumos', 'saida', '#FF3B30', 'egg'),
    (NEW.id, 'Embalagens & Caixas', 'saida', '#FF9500', 'package'),
    (NEW.id, 'Gás & Energia Elétrica', 'saida', '#FFCC00', 'flame'),
    (NEW.id, 'Delivery & Frete', 'saida', '#5856D6', 'truck'),
    (NEW.id, 'Marketing & Tráfego', 'saida', '#E05688', 'megaphone'),
    (NEW.id, 'Equipamentos & Utensílios', 'saida', '#007AFF', 'wrench'),
    (NEW.id, 'Taxas de Cartão & App', 'saida', '#8E8E93', 'credit-card'),
    (NEW.id, 'Pró-Labore & Pessoal', 'saida', '#34C759', 'user-check'),
    (NEW.id, 'Aluguel do Espaço', 'saida', '#AF52DE', 'home'),
    (NEW.id, 'Impostos & MEI', 'saida', '#64748B', 'file-text'),
    (NEW.id, 'Outros Gastos', 'saida', '#999999', 'more-horizontal');

  -- Meta inicial do mês corrente
  INSERT INTO public.metas (user_id, mes, meta_faturamento, limite_gastos)
  VALUES (
    NEW.id,
    date_trunc('month', current_date)::date,
    15000.00,
    6000.00
  ) ON CONFLICT (user_id, mes) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger disparado sempre que um novo usuário confirma cadastro no Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

