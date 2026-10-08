import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatBRL, formatDateBR } from '../../lib/formatters';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
} from 'lucide-react';
import type { Lancamento } from '../../types';

export const ContasView: React.FC<{ onNewTransaction: (tipo: 'entrada' | 'saida') => void }> = ({
  onNewTransaction,
}) => {
  const { lancamentos, updateLancamento } = useFinance();
  const [tab, setTab] = useState<'a_receber' | 'a_pagar'>('a_receber');

  // Filter pending transactions
  const pendentesReceber = lancamentos.filter(
    (l) => l.tipo === 'entrada' && l.status === 'pendente'
  );
  const pendentesPagar = lancamentos.filter(
    (l) => l.tipo === 'saida' && l.status === 'pendente'
  );

  const totalReceber = pendentesReceber.reduce((acc, curr) => acc + curr.valor, 0);
  const totalPagar = pendentesPagar.reduce((acc, curr) => acc + curr.valor, 0);

  const activeList = tab === 'a_receber' ? pendentesReceber : pendentesPagar;

  const handleMarcarComoPago = async (item: Lancamento) => {
    const novoStatus = item.tipo === 'entrada' ? 'recebido' : 'pago';
    await updateLancamento(item.id, { status: novoStatus });
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Cards de Resumo de Contas */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total a Receber */}
        <div
          onClick={() => setTab('a_receber')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            tab === 'a_receber'
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-[#1C1C1E] border-neutral-200/80 dark:border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">A Receber</span>
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={13} />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
            {formatBRL(totalReceber)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {pendentesReceber.length} encomenda(s) / fiados
          </p>
        </div>

        {/* Total a Pagar */}
        <div
          onClick={() => setTab('a_pagar')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            tab === 'a_pagar'
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-[#1C1C1E] border-neutral-200/80 dark:border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">A Pagar</span>
            <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ArrowDownRight size={13} />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-1">
            {formatBRL(totalPagar)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {pendentesPagar.length} conta(s) / boletos
          </p>
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          {tab === 'a_receber' ? 'Encomendas a Receber' : 'Contas e Boletos a Pagar'}
        </h3>
        <button
          onClick={() => onNewTransaction(tab === 'a_receber' ? 'entrada' : 'saida')}
          className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <Plus size={14} /> Novo agendamento
        </button>
      </div>

      {/* List Container */}
      {activeList.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 text-center border border-neutral-100 dark:border-neutral-800 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Tudo em dia!
          </p>
          <p className="text-xs text-neutral-400">
            Nenhuma conta pendente nesta categoria no momento.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
          {activeList.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <div className="space-y-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {item.origem}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium flex items-center gap-1">
                    <Calendar size={10} /> {formatDateBR(item.data)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {item.descricao || 'Sem descrição cadastrada'}
                </p>
                {item.observacao && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Nota: {item.observacao}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p
                    className={`text-sm sm:text-base font-bold ${
                      item.tipo === 'entrada'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatBRL(item.valor)}
                  </p>
                </div>
                <button
                  onClick={() => handleMarcarComoPago(item)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-all ios-active border border-neutral-200 dark:border-neutral-700"
                >
                  {item.tipo === 'entrada' ? 'Recebido ✓' : 'Pago ✓'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

