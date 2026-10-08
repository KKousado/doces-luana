import React, { useState, useEffect } from 'react';
import type { TipoTransacao, FormaPagamento, StatusTransacao, Lancamento } from '../../types';
import { useFinance } from '../../contexts/FinanceContext';
import { BottomSheet } from '../common/BottomSheet';
import { SegmentedControl } from '../common/SegmentedControl';
import { Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TipoTransacao;
  editingItem?: Lancamento | null;
}

const PAYMENT_METHODS: { id: FormaPagamento; label: string }[] = [
  { id: 'pix', label: 'Pix' },
  { id: 'cartao_credito', label: 'Crédito' },
  { id: 'cartao_debito', label: 'Débito' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'ifood', label: 'iFood' },
  { id: 'transferencia', label: 'TED/Doc' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'entrada',
  editingItem = null,
}) => {
  const { categorias, originsEntrada, originsSaida, addLancamento, updateLancamento } = useFinance();

  const [tipo, setTipo] = useState<TipoTransacao>(initialType);
  const [valorStr, setValorStr] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [origem, setOrigem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [status, setStatus] = useState<StatusTransacao>('pago');
  const [recorrente, setRecorrente] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when opening or changing item
  useEffect(() => {
    if (editingItem) {
      setTipo(editingItem.tipo);
      setValorStr(editingItem.valor.toString().replace('.', ','));
      setData(editingItem.data);
      setOrigem(editingItem.origem);
      setDescricao(editingItem.descricao || '');
      setCategoriaId(editingItem.categoria_id || '');
      setFormaPagamento(editingItem.forma_pagamento || 'pix');
      setStatus(editingItem.status);
      setRecorrente(editingItem.recorrente || false);
      setObservacao(editingItem.observacao || '');
    } else {
      setTipo(initialType);
      setValorStr('');
      setData(new Date().toISOString().slice(0, 10));
      setOrigem('');
      setDescricao('');
      setCategoriaId('');
      setFormaPagamento('pix');
      setStatus(initialType === 'entrada' ? 'recebido' : 'pago');
      setRecorrente(false);
      setObservacao('');
    }
    setErrorMsg('');
  }, [isOpen, editingItem, initialType]);

  // Filter available categories based on type
  const availableCategories = categorias.filter((c) => c.tipo === tipo);

  // Set default category when list updates or type changes
  useEffect(() => {
    if (!editingItem && availableCategories.length > 0 && !categoriaId) {
      setCategoriaId(availableCategories[0].id);
    }
  }, [tipo, availableCategories, editingItem, categoriaId]);

  const originSuggestions = tipo === 'entrada' ? originsEntrada : originsSaida;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Sanitize value input: supports formats like "1.250,50", "35,00", "50"
    const cleaned = valorStr.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(cleaned);

    if (isNaN(numericValue) || numericValue <= 0) {
      setErrorMsg('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!origem.trim()) {
      setErrorMsg(
        tipo === 'entrada'
          ? 'Informe de onde veio o valor (ex: Balcão, Encomenda, WhatsApp).'
          : 'Informe para onde foi o gasto (ex: Mercado, Fornecedor X, Atacadão).'
      );
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateLancamento(editingItem.id, {
          tipo,
          valor: numericValue,
          data,
          origem: origem.trim(),
          descricao: descricao.trim() || undefined,
          categoria_id: categoriaId || undefined,
          forma_pagamento: formaPagamento,
          status,
          recorrente,
          observacao: observacao.trim() || undefined,
        });
      } else {
        await addLancamento({
          tipo,
          valor: numericValue,
          data,
          origem: origem.trim(),
          descricao: descricao.trim() || undefined,
          categoria_id: categoriaId || undefined,
          forma_pagamento: formaPagamento,
          status,
          recorrente,
          observacao: observacao.trim() || undefined,
        });

        // Trigger celebratory confetti for new incoming sales!
        if (tipo === 'entrada') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#34C759', '#E05688', '#FFD700', '#007AFF'],
          });
        }
      }
      onClose();
    } catch {
      setErrorMsg('Ocorreu um erro ao salvar o lançamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Editar Lançamento' : tipo === 'entrada' ? 'Nova Entrada' : 'Nova Saída'}
      subtitle={
        tipo === 'entrada'
          ? 'Receita das vendas de doces e encomendas'
          : 'Custos, ingredientes e contas da loja'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type toggle (Entrada / Saída) */}
        {!editingItem && (
          <SegmentedControl
            options={[
              { label: '+ Entrada (Receita)', value: 'entrada' },
              { label: '- Saída (Despesa)', value: 'saida' },
            ]}
            value={tipo}
            onChange={(val) => {
              setTipo(val);
              setStatus(val === 'entrada' ? 'recebido' : 'pago');
            }}
          />
        )}

        {/* Hero Value Input (Large numeric display) */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 flex flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-1">
            Valor do Lançamento
          </span>
          <div className="flex items-center text-3xl sm:text-4xl font-bold tracking-tight">
            <span
              className={`mr-2 ${
                tipo === 'entrada' ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              R$
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valorStr}
              onChange={(e) => setValorStr(e.target.value)}
              className="w-44 text-center bg-transparent font-bold focus:outline-none placeholder-neutral-300 dark:placeholder-neutral-600 text-neutral-900 dark:text-white"
              autoFocus={!editingItem}
              required
            />
          </div>
        </div>

        {/* Error message alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Inset Group: Data & Origem */}
        <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 space-y-4">
          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Data da Operação
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Origem (com autocompletar) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {tipo === 'entrada' ? 'Origem da Entrada *' : 'Origem do Gasto / Fornecedor *'}
              </label>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> sugestões
              </span>
            </div>
            <input
              type="text"
              placeholder={
                tipo === 'entrada'
                  ? 'Ex: Balcão, Encomenda, WhatsApp, iFood'
                  : 'Ex: Atacadão, Embalagens, Gás Ultragaz, Motoboy'
              }
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-neutral-400"
              required
            />
            {/* Chips de autocompletar rápido */}
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-20 overflow-y-auto">
              {originSuggestions.slice(0, 6).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOrigem(item)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    origem === item
                      ? 'bg-blue-500 text-white border-blue-500 font-medium'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-blue-400'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição curta */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Descrição / Itens (opcional)
            </label>
            <input
              type="text"
              placeholder={
                tipo === 'entrada'
                  ? 'Ex: Bolo vulcão de Ninho + 20 brigadeiros'
                  : 'Ex: Caixa leite condensado Moça e cacau'
              }
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Inset Group: Categoria & Pagamento */}
        <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 space-y-4">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Categoria
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setFormaPagamento(pm.id)}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                    formaPagamento === pm.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status (Pago/Recebido vs Pendente) */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {tipo === 'entrada' ? 'Já recebido?' : 'Já pago?'}
              </span>
              <p className="text-xs text-neutral-400">
                {status === 'pendente'
                  ? 'Ficará na lista de contas pendentes'
                  : 'Registrado como valor quitado no fluxo'}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setStatus((prev) =>
                  prev === 'pendente'
                    ? tipo === 'entrada'
                      ? 'recebido'
                      : 'pago'
                    : 'pendente'
                )
              }
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                status !== 'pendente' ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  status !== 'pendente' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Gasto Recorrente (Apenas para saídas) */}
          {tipo === 'saida' && (
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Gasto Fixo / Recorrente?
                </span>
                <p className="text-xs text-neutral-400">Ex: Aluguel, energia, internet</p>
              </div>
              <button
                type="button"
                onClick={() => setRecorrente(!recorrente)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  recorrente ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    recorrente ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Observações adicionais */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Pegar comprovante, entrega agendada para 16h"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-white shadow-lg ios-active transition-all flex items-center justify-center gap-2 ${
            tipo === 'entrada'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
          }`}
        >
          <Check size={20} />
          <span>{submitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Confirmar Lançamento'}</span>
        </button>
      </form>
    </BottomSheet>
  );
};

