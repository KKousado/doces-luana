import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { formatBRL } from '../../lib/formatters';
import { Plus, Trash2, Tag, Percent, Calculator, Check } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';

export const ProdutosView: React.FC = () => {
  const { produtos, addProduto, deleteProduto } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [nome, setNome] = useState('');
  const [custoStr, setCustoStr] = useState('');
  const [precoStr, setPrecoStr] = useState('');
  const [categoria, setCategoria] = useState('Bolos');
  const [margemDesejada, setMargemDesejada] = useState('70'); // %

  const handleSugestaoPreco = () => {
    const custo = parseFloat(custoStr.replace(',', '.')) || 0;
    const margem = parseFloat(margemDesejada) || 70;
    if (custo > 0 && margem < 100) {
      // Preço de venda = Custo / (1 - Margem/100)
      const precoSugerido = custo / (1 - margem / 100);
      setPrecoStr(precoSugerido.toFixed(2).replace('.', ','));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const custo = parseFloat(custoStr.replace(',', '.')) || 0;
    const preco = parseFloat(precoStr.replace(',', '.')) || 0;

    if (!nome.trim() || preco <= 0) return;

    await addProduto({
      nome: nome.trim(),
      custo_ingredientes: custo,
      preco_venda: preco,
      categoria,
      ativo: true,
    });

    setNome('');
    setCustoStr('');
    setPrecoStr('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Cardápio & Ficha Técnica
          </h3>
          <p className="text-xs text-neutral-400">
            Custo dos ingredientes, preço e margem de lucro real
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm ios-active"
        >
          <Plus size={16} /> Novo Doce
        </button>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {produtos.map((p) => {
          const lucroReal = p.preco_venda - p.custo_ingredientes;
          const margem = p.margem_lucro_pct || (p.preco_venda > 0 ? (lucroReal / p.preco_venda) * 100 : 0);

          return (
            <div
              key={p.id}
              className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                    {p.categoria || 'Geral'}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
                    {p.nome}
                  </h4>
                </div>
                <button
                  onClick={() => deleteProduto(p.id)}
                  className="text-neutral-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Custo</span>
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {formatBRL(p.custo_ingredientes)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Preço Venda</span>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {formatBRL(p.preco_venda)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Margem</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {margem.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <span>Lucro Líquido por unidade:</span>
                <span className="font-bold">+{formatBRL(lucroReal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Produto */}
      <BottomSheet
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Cadastrar Doce / Produto"
        subtitle="Calcule o custo e a margem de lucro correta"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Nome do Doce / Produto *
            </label>
            <input
              type="text"
              placeholder="Ex: Bolo de Cenoura Vulcão"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Custo Ingredientes (R$)
              </label>
              <input
                type="text"
                placeholder="Ex: 18,50"
                value={custoStr}
                onChange={(e) => setCustoStr(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Margem Alvo (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={margemDesejada}
                  onChange={(e) => setMargemDesejada(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSugestaoPreco}
                  title="Calcular Preço Sugerido"
                  className="p-2.5 bg-blue-500 text-white rounded-xl text-xs font-semibold ios-active shrink-0"
                >
                  <Calculator size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Preço Final de Venda (R$) *
            </label>
            <input
              type="text"
              placeholder="Ex: 55,00"
              value={precoStr}
              onChange={(e) => setPrecoStr(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white font-bold focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg ios-active"
          >
            <Check size={18} /> Salvar Produto
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};

