import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import { formatBRL } from '../../lib/formatters';
import {
  Moon,
  Sun,
  Smartphone,
  Target,
  Download,
  Key,
  ShieldCheck,
  Check,
  Cake,
  FileSpreadsheet,
} from 'lucide-react';

export const AjustesView: React.FC = () => {
  const { user, isConfigured } = useAuth();
  const { theme, setTheme } = useTheme();
  const { meta, updateMeta, lancamentos } = useFinance();

  const [metaFatStr, setMetaFatStr] = useState(
    meta?.meta_faturamento ? meta.meta_faturamento.toString() : '8000'
  );
  const [limiteGastoStr, setLimiteGastoStr] = useState(
    meta?.limite_gastos ? meta.limite_gastos.toString() : '3500'
  );
  const [salvandoMeta, setSalvandoMeta] = useState(false);
  const [metaSalvaSucesso, setMetaSalvaSucesso] = useState(false);

  const handleSalvarMetas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoMeta(true);
    await updateMeta({
      meta_faturamento: parseFloat(metaFatStr) || 8000,
      limite_gastos: parseFloat(limiteGastoStr) || 3500,
    });
    setSalvandoMeta(false);
    setMetaSalvaSucesso(true);
    setTimeout(() => setMetaSalvaSucesso(false), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (lancamentos.length === 0) return;

    const headers = ['Data', 'Tipo', 'Origem', 'Categoria', 'Valor', 'Forma Pagamento', 'Status', 'Descricao'];
    const rows = lancamentos.map((l) => [
      l.data,
      l.tipo,
      `"${l.origem.replace(/"/g, '""')}"`,
      `"${(l.categoria?.nome || '').replace(/"/g, '""')}"`,
      l.valor.toFixed(2),
      l.forma_pagamento || '',
      l.status,
      `"${(l.descricao || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lancamentos-doces-da-luana-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* User Header Profile */}
      <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-bold text-xl shadow-md">
          DL
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Doces da Luana
          </h3>
          <p className="text-xs text-neutral-400">
            {user?.email || 'luana@docesdaluana.com.br'}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {isConfigured ? 'Supabase Conectado' : 'Modo Demonstração / Local'}
            </span>
          </div>
        </div>
      </div>

      {/* Metas Mensais */}
      <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-blue-500" />
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Configurar Metas do Mês
          </h4>
        </div>

        <form onSubmit={handleSalvarMetas} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Meta Faturamento (R$)
              </label>
              <input
                type="number"
                value={metaFatStr}
                onChange={(e) => setMetaFatStr(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl p-2.5 text-sm text-neutral-900 dark:text-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Limite Gastos (R$)
              </label>
              <input
                type="number"
                value={limiteGastoStr}
                onChange={(e) => setLimiteGastoStr(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl p-2.5 text-sm text-neutral-900 dark:text-white font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={salvandoMeta}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 ios-active"
          >
            {metaSalvaSucesso ? <Check size={16} /> : null}
            <span>{salvandoMeta ? 'Salvando...' : metaSalvaSucesso ? 'Salvo!' : 'Salvar Metas'}</span>
          </button>
        </form>
      </div>

      {/* Tema Visual (Aparência) */}
      <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Aparência do Sistema
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-semibold'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Sun size={20} className="mx-auto mb-1" />
            <span className="text-xs">Claro</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-semibold'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Moon size={20} className="mx-auto mb-1" />
            <span className="text-xs">Escuro</span>
          </button>

          <button
            onClick={() => setTheme('auto')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              theme === 'auto'
                ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-semibold'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Smartphone size={20} className="mx-auto mb-1" />
            <span className="text-xs">Automático</span>
          </button>
        </div>
      </div>

      {/* Exportação & Backup */}
      <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Dados & Exportação
        </h4>
        <button
          onClick={handleExportCSV}
          className="w-full py-3 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-between ios-active"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-500" />
            <span>Exportar Lançamentos (CSV Excel)</span>
          </div>
          <Download size={14} className="text-neutral-400" />
        </button>
      </div>

      {/* Como instalar PWA no iPhone */}
      <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          📱 Como instalar no iPhone (PWA)
        </h4>
        <ol className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5 list-decimal pl-4">
          <li>Abra o site no navegador <strong>Safari</strong> do iPhone.</li>
          <li>Toque no botão de <strong>Compartilhar</strong> (quadrado com seta para cima).</li>
          <li>Role a lista e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
          <li>O app terá ícone exclusivo e funcionará em tela cheia sem barras de navegação!</li>
        </ol>
      </div>


    </div>
  );
};

