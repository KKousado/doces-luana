import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TabBar, type TabType } from './TabBar';
import { DashboardView } from '../dashboard/DashboardView';
import { TransactionList } from '../transactions/TransactionList';
import { ContasView } from '../contas/ContasView';
import { ProdutosView } from '../produtos/ProdutosView';
import { AjustesView } from '../settings/AjustesView';
import { TransactionModal } from '../transactions/TransactionModal';
import { Plus, Cake, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Lancamento } from '../../types';

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'entrada' | 'saida'>('entrada');
  const [editingItem, setEditingItem] = useState<Lancamento | null>(null);

  // Quick Action Sheet selection
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const openNewTransaction = (type: 'entrada' | 'saida') => {
    setEditingItem(null);
    setModalType(type);
    setIsModalOpen(true);
    setShowQuickSelect(false);
  };

  const handleEditItem = (item: Lancamento) => {
    setEditingItem(item);
    setModalType(item.tipo);
    setIsModalOpen(true);
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'inicio':
        return 'Doces da Luana';
      case 'lancamentos':
        return 'Histórico de Lançamentos';
      case 'contas':
        return 'Contas a Pagar & Receber';
      case 'produtos':
        return 'Cardápio & Custos';
      case 'ajustes':
        return 'Ajustes & Configurações';
      default:
        return 'Doces da Luana';
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header iOS Large Title Style */}
      <header className="sticky top-0 z-30 bg-[#F2F2F7]/85 dark:bg-black/85 ios-blur pt-safe px-4 pb-3 border-b border-black/5 dark:border-white/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-pink-600 dark:text-pink-400 uppercase flex items-center gap-1">
              <Cake size={13} /> Confeitaria & Ateliê
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {getHeaderTitle()}
            </h1>
          </div>

          {/* Quick Action Buttons on header */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openNewTransaction('entrada')}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 ios-active hover:bg-emerald-500/25"
              title="Nova Entrada"
            >
              <ArrowUpRight size={15} />
              <span className="hidden sm:inline">+ Entrada</span>
            </button>
            <button
              onClick={() => openNewTransaction('saida')}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1 ios-active hover:bg-rose-500/25"
              title="Nova Saída"
            >
              <ArrowDownRight size={15} />
              <span className="hidden sm:inline">- Saída</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4">
        {activeTab === 'inicio' && (
          <DashboardView onNewTransaction={openNewTransaction} />
        )}
        {activeTab === 'lancamentos' && (
          <TransactionList onEdit={handleEditItem} />
        )}
        {activeTab === 'contas' && (
          <ContasView onNewTransaction={openNewTransaction} />
        )}
        {activeTab === 'produtos' && <ProdutosView />}
        {activeTab === 'ajustes' && <AjustesView />}
      </main>

      {/* Bottom Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenQuickAdd={() => setShowQuickSelect(true)}
      />

      {/* Quick Add Chooser Sheet (Entrada ou Saída) */}
      {showQuickSelect && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowQuickSelect(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-t-[26px] sm:rounded-[26px] shadow-2xl p-6 z-10 space-y-3 pb-safe animate-in slide-in-from-bottom duration-200">
            <h3 className="text-center text-sm font-semibold text-neutral-400 uppercase tracking-wider pb-1">
              O que você deseja registrar?
            </h3>
            <button
              onClick={() => openNewTransaction('entrada')}
              className="w-full py-4 px-5 rounded-2xl bg-emerald-500 text-white font-bold text-base flex items-center justify-between shadow-lg shadow-emerald-500/20 ios-active"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <ArrowUpRight size={22} />
                </div>
                <div className="text-left">
                  <span>+ Entrada (Venda / Receita)</span>
                  <p className="text-xs text-white/80 font-normal">Balcão, encomenda, WhatsApp, iFood</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => openNewTransaction('saida')}
              className="w-full py-4 px-5 rounded-2xl bg-rose-500 text-white font-bold text-base flex items-center justify-between shadow-lg shadow-rose-500/20 ios-active"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <ArrowDownRight size={22} />
                </div>
                <div className="text-left">
                  <span>- Saída (Gasto / Despesa)</span>
                  <p className="text-xs text-white/80 font-normal">Ingredientes, embalagens, contas</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowQuickSelect(false)}
              className="w-full py-3 rounded-xl text-neutral-400 text-xs font-semibold text-center hover:text-neutral-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        initialType={modalType}
        editingItem={editingItem}
      />
    </div>
  );
};
