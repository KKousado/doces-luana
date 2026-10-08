import React, { useMemo, useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatBRL } from '../../lib/formatters';
import { SegmentedControl } from '../common/SegmentedControl';
import { ExportModal } from './ExportModal';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  Share2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import type { PeriodoFiltro, Lancamento } from '../../types';

export const DashboardView: React.FC<{ onNewTransaction: (tipo: 'entrada' | 'saida') => void }> = ({
  onNewTransaction,
}) => {
  const { lancamentos, meta, categorias } = useFinance();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes');
  const [showExport, setShowExport] = useState(false);

  // Filter lancamentos by selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    return lancamentos.filter((item) => {
      const itemDate = new Date(item.data + 'T00:00:00');
      if (periodo === 'hoje') {
        const todayStr = now.toISOString().slice(0, 10);
        return item.data === todayStr;
      }
      if (periodo === 'semana') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      }
      if (periodo === 'mes') {
        return (
          itemDate.getFullYear() === now.getFullYear() &&
          itemDate.getMonth() === now.getMonth()
        );
      }
      if (periodo === 'ano') {
        return itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [lancamentos, periodo]);

  // Previous period for comparison calculations
  const previousData = useMemo(() => {
    const now = new Date();
    return lancamentos.filter((item) => {
      const itemDate = new Date(item.data + 'T00:00:00');
      if (periodo === 'mes') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return (
          itemDate.getFullYear() === lastYear &&
          itemDate.getMonth() === lastMonth
        );
      }
      return false;
    });
  }, [lancamentos, periodo]);

  // Summary Metrics
  const totalEntradas = filteredData
    .filter((l) => l.tipo === 'entrada' && l.status !== 'pendente')
    .reduce((sum, l) => sum + l.valor, 0);

  const totalSaidas = filteredData
    .filter((l) => l.tipo === 'saida' && l.status !== 'pendente')
    .reduce((sum, l) => sum + l.valor, 0);

  const saldo = totalEntradas - totalSaidas;
  const margemLucroPct = totalEntradas > 0 ? (saldo / totalEntradas) * 100 : 0;

  // Previous Month Totals
  const prevEntradas = previousData
    .filter((l) => l.tipo === 'entrada' && l.status !== 'pendente')
    .reduce((sum, l) => sum + l.valor, 0);

  const prevSaidas = previousData
    .filter((l) => l.tipo === 'saida' && l.status !== 'pendente')
    .reduce((sum, l) => sum + l.valor, 0);

  const entradaDiffPct =
    prevEntradas > 0 ? ((totalEntradas - prevEntradas) / prevEntradas) * 100 : 0;
  const saidaDiffPct =
    prevSaidas > 0 ? ((totalSaidas - prevSaidas) / prevSaidas) * 100 : 0;

  // 1. Despesas por Categoria (Donut)
  const gastosPorCategoria = useMemo(() => {
    const map: { [key: string]: { name: string; value: number; color: string } } = {};
    filteredData
      .filter((l) => l.tipo === 'saida')
      .forEach((item) => {
        const catName = item.categoria?.nome || 'Outros Gastos';
        const catColor = item.categoria?.cor || '#FF3B30';
        if (!map[catName]) {
          map[catName] = { name: catName, value: 0, color: catColor };
        }
        map[catName].value += item.valor;
      });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // 2. Entradas x Saídas ao longo do tempo (Dias ou Semanas)
  const timelineData = useMemo(() => {
    const dayMap: { [key: string]: { data: string; entradas: number; saidas: number } } = {};
    filteredData.forEach((item) => {
      const dayKey = item.data.slice(5); // MM-DD
      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { data: dayKey, entradas: 0, saidas: 0 };
      }
      if (item.tipo === 'entrada') {
        dayMap[dayKey].entradas += item.valor;
      } else {
        dayMap[dayKey].saidas += item.valor;
      }
    });
    return Object.values(dayMap).sort((a, b) => a.data.localeCompare(b.data));
  }, [filteredData]);

  // 3. Top 5 Origens de Gastos ("Onde estou gastando")
  const topGastosOrigens = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredData
      .filter((l) => l.tipo === 'saida')
      .forEach((l) => {
        map[l.origem] = (map[l.origem] || 0) + l.valor;
      });
    return Object.entries(map)
      .map(([origem, valor]) => ({ origem, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [filteredData]);

  // 4. Entradas por Origem (Canais de venda que mais rendem)
  const entradasOrigens = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredData
      .filter((l) => l.tipo === 'entrada')
      .forEach((l) => {
        map[l.origem] = (map[l.origem] || 0) + l.valor;
      });
    return Object.entries(map)
      .map(([origem, valor]) => ({ origem, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [filteredData]);

  // Contas Pendentes (Próximos recebimentos e pagamentos)
  const pendentes = useMemo(() => {
    return lancamentos.filter((l) => l.status === 'pendente');
  }, [lancamentos]);

  // Meta mensal calculations
  const metaFat = meta?.meta_faturamento || 8000;
  const limGastos = meta?.limite_gastos || 3500;
  const fatPct = Math.min(100, Math.round((totalEntradas / metaFat) * 100));
  const gastoPct = Math.min(100, Math.round((totalSaidas / limGastos) * 100));

  // Automated smart insights
  const smartInsight = useMemo(() => {
    if (gastoPct >= 90) {
      return `Atenção Luana: Você já atingiu ${gastoPct}% do seu limite de gastos mensal! Cuidado com novas compras de embalagens e insumos.`;
    }
    if (fatPct >= 80) {
      return `Parabéns Luana! Você já atingiu ${fatPct}% da meta de vendas do mês! Continue promovendo as fatias e encomendas no WhatsApp! 🎉`;
    }
    if (topGastosOrigens.length > 0) {
      return `Seu maior gasto neste período foi com "${topGastosOrigens[0].origem}" somando ${formatBRL(
        topGastosOrigens[0].valor
      )}.`;
    }
    return 'Dica: Mantenha todos os recebimentos do balcão e iFood registrados diariamente para acompanhar o lucro real!';
  }, [gastoPct, fatPct, topGastosOrigens]);

  const periodoLabel =
    periodo === 'hoje'
      ? 'Hoje'
      : periodo === 'semana'
      ? 'Últimos 7 dias'
      : periodo === 'mes'
      ? 'Este Mês'
      : periodo === 'ano'
      ? 'Este Ano'
      : 'Geral';

  return (
    <div className="space-y-6 pb-24">
      {/* Top Controls: Period & Export Action Sheet */}
      <div className="flex items-center justify-between gap-2">
        <SegmentedControl
          className="flex-1 max-w-sm"
          options={[
            { label: 'Hoje', value: 'hoje' },
            { label: 'Semana', value: 'semana' },
            { label: 'Mês', value: 'mes' },
            { label: 'Ano', value: 'ano' },
          ]}
          value={periodo}
          onChange={(val) => setPeriodo(val)}
        />

        <button
          onClick={() => setShowExport(true)}
          className="p-2.5 bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-700 dark:text-neutral-200 hover:text-blue-500 ios-active shadow-xs flex items-center gap-1.5 text-xs font-semibold"
          aria-label="Exportar e Compartilhar"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>
      </div>

      {/* Main Exportable Section */}
      <div id="dashboard-exportable-content" className="space-y-5">
        {/* Smart Insight Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Insight Doces da Luana
            </p>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
              {smartInsight}
            </p>
          </div>
        </div>

        {/* 4 Summary Cards (iOS Inset Card Style) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card Entradas */}
          <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">Entradas</span>
              <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
                <ArrowUpRight size={14} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {formatBRL(totalEntradas)}
            </div>
            {prevEntradas > 0 && (
              <p
                className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                  entradaDiffPct >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {entradaDiffPct >= 0 ? '▲' : '▼'} {Math.abs(entradaDiffPct).toFixed(0)}% vs mês ant.
              </p>
            )}
          </div>

          {/* Card Saídas */}
          <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">Saídas</span>
              <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
                <ArrowDownRight size={14} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {formatBRL(totalSaidas)}
            </div>
            {prevSaidas > 0 && (
              <p
                className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                  saidaDiffPct <= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {saidaDiffPct > 0 ? '▲' : '▼'} {Math.abs(saidaDiffPct).toFixed(0)}% vs mês ant.
              </p>
            )}
          </div>

          {/* Card Saldo (Sobrou/Faltou) */}
          <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">
                {saldo >= 0 ? 'Sobrou (Lucro)' : 'Faltou (Déficit)'}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  saldo >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-500'
                }`}
              >
                <DollarSign size={14} />
              </div>
            </div>
            <div
              className={`text-lg sm:text-2xl font-bold tracking-tight ${
                saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatBRL(saldo)}
            </div>
            <p className="text-[11px] text-neutral-400">Fluxo líquido do período</p>
          </div>

          {/* Card Margem de Lucro % */}
          <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium">Margem de Lucro</span>
              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {margemLucroPct.toFixed(1)}%
            </div>
            <p className="text-[11px] text-neutral-400">Retorno sobre faturamento</p>
          </div>
        </div>

        {/* Goals / Metas Progress Bar */}
        <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Target size={14} className="text-blue-500" /> Metas do Mês
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              Faturamento & Gastos
            </span>
          </div>

          {/* Meta Faturamento */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-300">
                Meta de Vendas: <strong>{formatBRL(totalEntradas)}</strong> / {formatBRL(metaFat)}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {fatPct}%
              </span>
            </div>
            <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${fatPct}%` }}
              />
            </div>
          </div>

          {/* Limite de Gastos */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-300">
                Limite de Gastos: <strong>{formatBRL(totalSaidas)}</strong> / {formatBRL(limGastos)}
              </span>
              <span
                className={`font-bold ${
                  gastoPct >= 90 ? 'text-rose-500' : 'text-amber-500'
                }`}
              >
                {gastoPct}%
              </span>
            </div>
            <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  gastoPct >= 90 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${gastoPct}%` }}
              />
            </div>
            {gastoPct >= 85 && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 pt-0.5">
                <AlertTriangle size={12} /> Alerta: Próximo ou acima do teto de gastos estipulado.
              </p>
            )}
          </div>
        </div>

        {/* Gráfico 1: Gastos por Categoria (Donut / Rosca) */}
        <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Gastos por Categoria
            </h3>
            <span className="text-xs text-neutral-400">Proporção %</span>
          </div>

          {gastosPorCategoria.length > 0 ? (
            <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val) || 0), 'Valor']}
                    contentStyle={{
                      backgroundColor: 'rgba(28, 28, 30, 0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legenda Lateral */}
              <div className="w-full sm:w-48 max-h-48 overflow-y-auto space-y-1.5 text-xs pt-2 sm:pt-0">
                {gastosPorCategoria.map((c) => {
                  const pct = totalSaidas > 0 ? ((c.value / totalSaidas) * 100).toFixed(0) : 0;
                  return (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-neutral-600 dark:text-neutral-300 truncate">
                          {c.name}
                        </span>
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-center py-8 text-neutral-400">
              Nenhum gasto registrado neste período.
            </p>
          )}
        </div>

        {/* Gráfico 2: Top 5 Origens de Gastos ("Onde estou gastando") */}
        <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Onde estou gastando? (Top 5 Fornecedores)
            </h3>
            <span className="text-xs text-neutral-400">Maiores valores</span>
          </div>

          {topGastosOrigens.length > 0 ? (
            <div className="space-y-3 pt-2">
              {topGastosOrigens.map((item, idx) => {
                const maxVal = topGastosOrigens[0].valor || 1;
                const widthPct = Math.round((item.valor / maxVal) * 100);
                return (
                  <div key={item.origem} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {idx + 1}. {item.origem}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {formatBRL(item.valor)}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center py-6 text-neutral-400">
              Nenhuma despesa para exibir no ranking.
            </p>
          )}
        </div>

        {/* Gráfico 3: Entradas por Origem (Canais que mais rendem) */}
        <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Qual canal de venda mais rende?
            </h3>
            <span className="text-xs text-neutral-400">Faturamento por canal</span>
          </div>

          {entradasOrigens.length > 0 ? (
            <div className="space-y-3 pt-2">
              {entradasOrigens.map((item, idx) => {
                const maxVal = entradasOrigens[0].valor || 1;
                const widthPct = Math.round((item.valor / maxVal) * 100);
                return (
                  <div key={item.origem} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {idx + 1}. {item.origem}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatBRL(item.valor)}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center py-6 text-neutral-400">
              Nenhuma entrada registrada neste período.
            </p>
          )}
        </div>

        {/* Contas Pendentes Próximas (A pagar e A receber) */}
        {pendentes.length > 0 && (
          <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Clock size={16} className="text-amber-500" /> Contas Pendentes
              </h3>
              <span className="text-xs text-amber-600 font-medium">
                {pendentes.length} pendente(s)
              </span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {pendentes.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {p.origem}
                    </span>
                    <p className="text-neutral-400 truncate mt-0.5">
                      {p.descricao || 'Sem descrição'} · {p.tipo === 'entrada' ? 'A Receber' : 'A Pagar'}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      p.tipo === 'entrada'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {p.tipo === 'entrada' ? '+' : '-'} {formatBRL(p.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Action Sheet Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        targetElementId="dashboard-exportable-content"
        reportTitle={`Doces da Luana · Relatório ${periodoLabel}`}
        summaryData={{
          periodoLabel,
          totalEntradas,
          totalSaidas,
          saldo,
          margemPct: margemLucroPct,
          topGastos: topGastosOrigens,
        }}
      />
    </div>
  );
};

