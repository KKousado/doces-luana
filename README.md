# 🍰 Doces da Luana · Sistema de Controle Financeiro

Sistema completo de controle e acompanhamento financeiro desenvolvido sob medida para a confeitaria e loja de doces **"Doces da Luana"**. O aplicativo foi projetado com abordagem **mobile-first** seguindo a linguagem visual e diretrizes de design do **Apple iOS** (SF Pro, cantos arredondados, Inset Grouped Lists, Bottom Sheets, modo claro/escuro nativo e suporte a PWA).

---

## 📱 Principais Funcionalidades

1. **Dashboard & Indicadores Financeiros**:
   - Resumo claro: **Entradas**, **Saídas**, **Saldo (Sobrou/Faltou)** e **Margem de Lucro %**.
   - Comparativo percentual automático com o período anterior (▲ / ▼).
   - Filtro por períodos: *Hoje*, *Semana*, *Mês* e *Ano*.
   - **Metas do Mês**: barra de progresso visual de faturamento e limite de gastos com alerta suave de proximidade de teto.
   - **Insights Automáticos**: mensagens inteligentes apontando gastos de destaque e status de metas.

2. **Gráficos Interativos (Recharts)**:
   - **Gastos por Categoria**: Gráfico Donut/Rosca com proporção percentual de custos.
   - **Onde estou gastando? (Top 5 Fornecedores)**: Barras horizontais com ranking de gastos.
   - **Qual canal mais rende?**: Comparativo de vendas por origem (Balcão, Encomendas, WhatsApp, iFood, etc.).

3. **Lançamentos & Extrato Completo**:
   - Lista agrupada por dia no estilo *iOS Inset Grouped List*.
   - Cores semânticas: Verde Apple (`#34C759`) para entradas, Vermelho (`#FF3B30`) para saídas.
   - Busca em tempo real e filtros avançados (Tipo, Status, Origem e Ordenação).
   - Ações de Edição, Exclusão e Notificação com botão **"Desfazer"** (Undo).

4. **Bottom Sheet iOS com Autocompletar**:
   - Formulário ergonômico com teclado decimal e atalhos rápidos.
   - Sugestões dinâmicas de origens baseadas no histórico.
   - Efeito comemorativo de confetes ao registrar novas vendas.

5. **Contas a Pagar e a Receber**:
   - Acompanhamento de encomendas com sinal pendente e fiados.
   - Boletos de fornecedores com lembrete de vencimento.
   - Baixa com 1 toque (*"Recebido ✓"* / *"Pago ✓"*).

6. **Cardápio & Ficha Técnica de Doces**:
   - Cálculo de custo de ingredientes, preço de venda e margem de lucro real.
   - Calculadora com sugestão de preço baseada na margem desejada.

7. **Exportação & Compartilhamento (WhatsApp, PNG e PDF)**:
   - **WhatsApp**: Envio rápido do resumo financeiro via Web Share API com fallback para link direto `wa.me`.
   - **PNG em Alta Resolução**: Captura nítida via `html2canvas` para postagens ou relatórios.
   - **PDF**: Relatório pronto para impressão A4 via `jsPDF`.
   - **CSV / Excel**: Exportação completa de todas as transações em planilha.

8. **PWA Instalável no iPhone**:
   - Manifest configurado e Service Worker ativo para suporte offline e tela cheia sem barras no Safari.

---

## 🗄️ 1. Configuração do Banco de Dados (Supabase)

O arquivo [`supabase_schema.sql`](./supabase_schema.sql) contém o script SQL pronto para execução no Supabase:

1. Acesse o painel do Supabase em [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Abra o projeto `unzzrlcminkudoolooer`.
3. No menu lateral, acesse **SQL Editor**.
4. Cole o conteúdo de [`supabase_schema.sql`](./supabase_schema.sql) e clique em **Run**.
5. O script criará:
   - Tabela `categorias` com trigger de inserção automática de categorias padrão para confeitarias.
   - Tabela `lancamentos` com índices de alta velocidade em `(user_id, data)`.
   - Tabela `metas` com controle de faturamento e limite de gastos.
   - Tabela `produtos` para o cardápio e ficha técnica.
   - **Row Level Security (RLS)** ativo com políticas seguras `auth.uid() = user_id`.

---

## ⚙️ 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou copie de `.env.example`):

```bash
cp .env.example .env
```

Preencha a chave **anon (pública)** do Supabase:

```env
VITE_SUPABASE_URL=https://unzzrlcminkudoolooer.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_publica_aqui
```

> **Nota:** Se a chave anon ainda não for configurada, o aplicativo entrará em **Modo Demonstração** com dados realistas já populados para que você consiga navegar e testar todas as telas imediatamente.

---

## 🚀 3. Executando Localmente

Para rodar em desenvolvimento:

```bash
npm run dev
```

Para gerar a build de produção otimizada:

```bash
npm run build
```

---

## ☁️ 4. Instruções de Deploy

### Opção A: Deploy na Vercel (Recomendado)
1. Instale a CLI ou conecte seu repositório no [vercel.com](https://vercel.com).
2. Defina as variáveis de ambiente em **Project Settings > Environment Variables**:
   - `VITE_SUPABASE_URL`: `https://unzzrlcminkudoolooer.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: sua chave anon do Supabase
3. O build command padrão é `npm run build` e o output directory é `dist`.

### Opção B: Deploy no Netlify
1. Conecte o repositório no [netlify.com](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

---

## 📲 5. Como Adicionar à Tela de Início do iPhone

1. Acesse o endereço publicado no navegador **Safari** do iPhone.
2. Toque no ícone de **Compartilhar** (quadrado com uma seta para cima na barra inferior).
3. Role as opções para cima e selecione **"Adicionar à Tela de Início"**.
4. Confirme o nome **"Doces da Luana"** e toque em **Adicionar**.
5. O ícone oficial será fixado na tela do iPhone e abrirá como um aplicativo nativo (PWA em tela cheia).
