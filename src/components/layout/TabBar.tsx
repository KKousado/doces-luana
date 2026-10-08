import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Clock,
  Cake,
  Settings,
  Plus,
} from 'lucide-react';

export type TabType = 'inicio' | 'lancamentos' | 'contas' | 'produtos' | 'ajustes';

interface TabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAdd,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#1C1C1E]/80 ios-blur border-t border-neutral-200/80 dark:border-neutral-800/80 pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Início */}
        <button
          onClick={() => onChangeTab('inicio')}
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-active ${
            activeTab === 'inicio'
              ? 'text-pink-600 dark:text-pink-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          <LayoutDashboard size={20} strokeWidth={activeTab === 'inicio' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1">Início</span>
        </button>

        {/* Lançamentos */}
        <button
          onClick={() => onChangeTab('lancamentos')}
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-active ${
            activeTab === 'lancamentos'
              ? 'text-pink-600 dark:text-pink-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          <Receipt size={20} strokeWidth={activeTab === 'lancamentos' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1">Extrato</span>
        </button>

        {/* Quick Add Floating Center Action */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenQuickAdd}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-600/30 flex items-center justify-center ios-active transform hover:scale-105 transition-transform"
            aria-label="Adicionar Lançamento"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* Contas */}
        <button
          onClick={() => onChangeTab('contas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-active ${
            activeTab === 'contas'
              ? 'text-pink-600 dark:text-pink-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          <Clock size={20} strokeWidth={activeTab === 'contas' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1">Contas</span>
        </button>

        {/* Cardápio & Produtos */}
        <button
          onClick={() => onChangeTab('produtos')}
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-active ${
            activeTab === 'produtos'
              ? 'text-pink-600 dark:text-pink-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          <Cake size={20} strokeWidth={activeTab === 'produtos' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1">Doces</span>
        </button>

        {/* Ajustes */}
        <button
          onClick={() => onChangeTab('ajustes')}
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-active ${
            activeTab === 'ajustes'
              ? 'text-pink-600 dark:text-pink-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          <Settings size={20} strokeWidth={activeTab === 'ajustes' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1">Ajustes</span>
        </button>
      </div>
    </div>
  );
};

