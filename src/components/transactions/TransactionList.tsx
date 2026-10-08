import React, { useState, useMemo } from 'react';
import type { Lancamento } from '../../types';
import { useFinance } from '../../contexts/FinanceContext';
import { formatBRL, formatDateBR, formatRelativeDate } from '../../lib/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface TransactionListProps {
  onEdit: (item: Lancamento) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
  const { lancamentos, deleteLancamento, restoreLancamento, lastDeletedItem, clearLastDeleted } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [filterOrigem, setFilterOrigem] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'recente' | 'maior_valor'>('recente');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [actionItem, setActionItem] = useState<Lancamento | null>(null);

  // All origins for filtering dropdown
  const allOrigins = useMemo(() => {
    return Array.from(new Set(lancamentos.map((l) => l.origem))).filter(Boolean);
  }, [lancamentos]);

  // Filter & Search logic
  const filteredLancamentos = useMemo(() => {
    return lancamentos
      .filter((item) => {
        if (filterTipo !== 'todos' && item.tipo !== filterTipo) return false;
        if (filterStatus === 'pago' && item.status === 'pendente') return false;
        if (filterStatus === 'pendente' && item.status !== 'pendente') return false;
        if (filterOrigem !== 'todos' && item.origem !== filterOrigem) return false;

        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();
          const matchOrigem = item.origem.toLowerCase().includes(query);
          const matchDesc = item.descricao?.toLowerCase().includes(query) ?? false;
          const matchCat = item.categoria?.nome.toLowerCase().includes(query) ?? false;
          const matchObs = item.observacao?.toLowerCase().includes(query) ?? false;
          return matchOrigem || matchDesc || matchCat || matchObs;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'maior_valor') {
          return b.valor - a.valor;
        }
        // Default: most recent date first
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });
  }, [lancamentos, filterTipo, filterStatus, filterOrigem, searchTerm, sortBy]);

  // Group by day for iOS Inset Grouped List style
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: Lancamento[] } = {};
    for (const item of filteredLancamentos) {
      if (!groups[item.data]) {
        groups[item.data] = [];
      }
      groups[item.data].push(item);
    }
    return groups;
  }, [filteredLancamentos]);

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const handleDelete = async (item: Lancamento) => {
    setActionItem(null);
    await deleteLancamento(item.id);
  };

  const handleUndo = async () => {
    if (lastDeletedItem) {
      await restoreLancamento(lastDeletedItem);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Search and Quick Filters bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Buscar por origem, item ou nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        <button
          onClick={() => setShowFiltersModal(!showFiltersModal)}
          className={`p-2.5 rounded-2xl border transition-all ios-active ${
            filterTipo !== 'todos' || filterStatus !== 'todos' || filterOrigem !== 'todos'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white dark:bg-[#1C1C1E] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
          aria-label="Filtros avançados"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Undo Toast Notification */}
      {lastDeletedItem && (
        <div className="flex items-center justify-between p-3.5 bg-neutral-900 text-white rounded-2xl shadow-xl animate-in slide-in-from-top duration-200">
          <span className="text-xs">
            Lançamento de <strong>{formatBRL(lastDeletedItem.valor)}</strong> removido.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 ios-active bg-neutral-800 px-2.5 py-1 rounded-xl"
            >
              <RotateCcw size={12} /> Desfazer
            </button>
            <button
              onClick={clearLastDeleted}
              className="text-neutral-400 hover:text-neutral-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Expanded Filter Panel */}
      {showFiltersModal && (
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Filtros & Ordenação
            </span>
            <button
              onClick={() => {
                setFilterTipo('todos');
                setFilterStatus('todos');
                setFilterOrigem('todos');
                setSortBy('recente');
              }}
              className="text-xs text-blue-500 hover:underline"
            >
              Limpar filtros
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Tipo */}
            <div>
              <label className="block text-neutral-400 mb-1">Tipo</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-neutral-100"
              >
                <option value="todos">Todos os tipos</option>
                <option value="entrada">Apenas Entradas</option>
                <option value="saida">Apenas Saídas</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-neutral-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-neutral-100"
              >
                <option value="todos">Todos os status</option>
                <option value="pago">Quitados / Recebidos</option>
                <option value="pendente">Apenas Pendentes</option>
              </select>
            </div>

            {/* Origem */}
            <div>
              <label className="block text-neutral-400 mb-1">Origem / Canal</label>
              <select
                value={filterOrigem}
                onChange={(e) => setFilterOrigem(e.target.value)}
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-neutral-100"
              >
                <option value="todos">Todas as origens</option>
                {allOrigins.map((orig) => (
                  <option key={orig} value={orig}>
                    {orig}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-neutral-400 mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-neutral-100"
              >
                <option value="recente">Mais Recente</option>
                <option value="maior_valor">Maior Valor</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLancamentos.length === 0 && (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-10 text-center border border-neutral-100 dark:border-neutral-800 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <Filter size={24} />
          </div>
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Nenhum lançamento encontrado
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Não há registros para os filtros selecionados ou nenhuma movimentação foi adicionada ainda.
          </p>
        </div>
      )}

      {/* Inset Grouped List by Day */}
      {sortedDates.map((dateStr) => {
        const items = groupedByDate[dateStr];
        const dayTotalEntrada = items
          .filter((i) => i.tipo === 'entrada')
          .reduce((acc, curr) => acc + curr.valor, 0);
        const dayTotalSaida = items
          .filter((i) => i.tipo === 'saida')
          .reduce((acc, curr) => acc + curr.valor, 0);

        return (
          <div key={dateStr} className="space-y-1.5">
            {/* Header do Dia estilo iOS */}
            <div className="flex items-center justify-between px-3 text-xs">
              <span className="font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                {formatRelativeDate(dateStr)} ({formatDateBR(dateStr)})
              </span>
              <div className="flex items-center gap-2 text-[11px] font-medium">
                {dayTotalEntrada > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{formatBRL(dayTotalEntrada)}
                  </span>
                )}
                {dayTotalSaida > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    -{formatBRL(dayTotalSaida)}
                  </span>
                )}
              </div>
            </div>

            {/* Inset Group Container */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xs border border-neutral-200/80 dark:border-neutral-800/90 divide-y divide-neutral-100 dark:divide-neutral-800/80 overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActionItem(item)}
                  className="p-3.5 flex items-center justify-between hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  {/* Left: Icon & Names */}
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <CategoryIcon
                      name={item.categoria?.icone || (item.tipo === 'entrada' ? 'store' : 'tag')}
                      color={
                        item.categoria?.cor ||
                        (item.tipo === 'entrada' ? '#34C759' : '#FF3B30')
                      }
                      size={20}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {item.origem}
                        </p>
                        {item.status === 'pendente' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                            <Clock size={10} /> Pendente
                          </span>
                        )}
                        {item.recorrente && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                            Fixo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {item.descricao || item.categoria?.nome || 'Sem descrição'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Value with color */}
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm sm:text-base font-bold tracking-tight flex items-center justify-end ${
                        item.tipo === 'entrada'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.tipo === 'entrada' ? '+' : '-'} {formatBRL(item.valor)}
                    </p>
                    <span className="text-[11px] text-neutral-400 capitalize">
                      {item.forma_pagamento?.replace('_', ' ') || 'Pix'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Action Sheet Modal for Selected Item */}
      {actionItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setActionItem(null)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-t-[24px] sm:rounded-[24px] shadow-2xl p-5 z-10 space-y-4 pb-safe animate-in slide-in-from-bottom duration-200">
            <div className="text-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs uppercase font-semibold text-neutral-400">
                Detalhes do Lançamento
              </span>
              <h4 className="text-xl font-bold mt-1 text-neutral-900 dark:text-white">
                {actionItem.origem}
              </h4>
              <p
                className={`text-lg font-bold mt-0.5 ${
                  actionItem.tipo === 'entrada'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {actionItem.tipo === 'entrada' ? '+' : '-'} {formatBRL(actionItem.valor)}
              </p>
              {actionItem.descricao && (
                <p className="text-xs text-neutral-500 mt-1 italic">
                  "{actionItem.descricao}"
                </p>
              )}
              {actionItem.observacao && (
                <p className="text-xs text-neutral-400 mt-1">
                  Nota: {actionItem.observacao}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const itm = actionItem;
                  setActionItem(null);
                  onEdit(itm);
                }}
                className="w-full py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-sm flex items-center justify-center gap-2 ios-active"
              >
                <Edit2 size={16} /> Editar Lançamento
              </button>
              <button
                onClick={() => handleDelete(actionItem)}
                className="w-full py-3 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium text-sm flex items-center justify-center gap-2 ios-active"
              >
                <Trash2 size={16} /> Excluir Lançamento
              </button>
              <button
                onClick={() => setActionItem(null)}
                className="w-full py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-medium text-sm text-center ios-active"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

