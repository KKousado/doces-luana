import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import type { Categoria, Lancamento, Meta, Produto } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  INITIAL_CATEGORIES,
  INITIAL_LANCAMENTOS,
  INITIAL_META,
  INITIAL_PRODUTOS,
  INITIAL_ORIGINS_ENTRADA,
  INITIAL_ORIGINS_SAIDA,
} from '../lib/mockData';

interface FinanceContextType {
  lancamentos: Lancamento[];
  categorias: Categoria[];
  meta: Meta | null;
  produtos: Produto[];
  loading: boolean;
  originsEntrada: string[];
  originsSaida: string[];
  addLancamento: (item: Omit<Lancamento, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateLancamento: (id: string, item: Partial<Lancamento>) => Promise<boolean>;
  deleteLancamento: (id: string) => Promise<{ success: boolean; undoneItem?: Lancamento }>;
  restoreLancamento: (item: Lancamento) => Promise<boolean>;
  updateMeta: (meta: Partial<Meta>) => Promise<boolean>;
  addProduto: (prod: Omit<Produto, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  deleteProduto: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
  lastDeletedItem: Lancamento | null;
  clearLastDeleted: () => void;
}

const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

const STORAGE_KEY = 'doces_da_luana_finance_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [, startTransition] = useTransition();

  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`${STORAGE_KEY}_lancamentos`);
    return saved ? JSON.parse(saved) : INITIAL_LANCAMENTOS;
  });

  const [categorias, setCategorias] = useState<Categoria[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`${STORAGE_KEY}_categorias`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [meta, setMeta] = useState<Meta | null>(() => {
    if (isSupabaseConfigured) return null;
    const saved = localStorage.getItem(`${STORAGE_KEY}_meta`);
    return saved ? JSON.parse(saved) : INITIAL_META;
  });

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`${STORAGE_KEY}_produtos`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUTOS;
  });

  const [loading, setLoading] = useState(false);
  const [lastDeletedItem, setLastDeletedItem] = useState<Lancamento | null>(null);

  // Sync to local storage for offline / quick recovery
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(`${STORAGE_KEY}_lancamentos`, JSON.stringify(lancamentos));
    }
  }, [lancamentos]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(`${STORAGE_KEY}_categorias`, JSON.stringify(categorias));
    }
  }, [categorias]);

  useEffect(() => {
    if (!isSupabaseConfigured && meta) {
      localStorage.setItem(`${STORAGE_KEY}_meta`, JSON.stringify(meta));
    }
  }, [meta]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(`${STORAGE_KEY}_produtos`, JSON.stringify(produtos));
    }
  }, [produtos]);

  // Load from Supabase if configured and user is logged in
  const fetchData = async () => {
    if (!isSupabaseConfigured || !user) return;
    setLoading(true);
    try {
      const [catRes, lancRes, metaRes, prodRes] = await Promise.all([
        supabase.from('categorias').select('*').order('nome'),
        supabase.from('lancamentos').select('*, categoria:categorias(*)').order('data', { ascending: false }),
        supabase.from('metas').select('*').order('mes', { ascending: false }).limit(1),
        supabase.from('produtos').select('*').order('nome'),
      ]);

      if (catRes.data && catRes.data.length > 0) {
        setCategorias(catRes.data);
      } else {
        setCategorias(INITIAL_CATEGORIES);
      }
      if (lancRes.data) {
        setLancamentos(lancRes.data);
      }
      if (metaRes.data && metaRes.data.length > 0) {
        setMeta(metaRes.data[0]);
      } else {
        setMeta(INITIAL_META);
      }
      if (prodRes.data && prodRes.data.length > 0) {
        setProdutos(prodRes.data);
      } else {
        setProdutos(INITIAL_PRODUTOS);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Derived Origins
  const originsEntrada = Array.from(
    new Set([
      ...INITIAL_ORIGINS_ENTRADA,
      ...lancamentos.filter((l) => l.tipo === 'entrada').map((l) => l.origem),
    ])
  ).filter(Boolean);

  const originsSaida = Array.from(
    new Set([
      ...INITIAL_ORIGINS_SAIDA,
      ...lancamentos.filter((l) => l.tipo === 'saida').map((l) => l.origem),
    ])
  ).filter(Boolean);

  const addLancamento = async (item: Omit<Lancamento, 'id' | 'user_id' | 'created_at'>) => {
    const tempId = 'l-' + Date.now();
    const newItem: Lancamento = {
      ...item,
      id: tempId,
      user_id: user?.id || 'demo',
      created_at: new Date().toISOString(),
      categoria: categorias.find((c) => c.id === item.categoria_id),
    };

    // Optimistic Update
    startTransition(() => {
      setLancamentos((prev) => [newItem, ...prev]);
    });

    if (isSupabaseConfigured && user) {
      const { data, error } = await supabase
        .from('lancamentos')
        .insert([{
          user_id: user.id,
          tipo: item.tipo,
          valor: item.valor,
          data: item.data,
          descricao: item.descricao,
          origem: item.origem,
          categoria_id: item.categoria_id,
          forma_pagamento: item.forma_pagamento,
          status: item.status,
          recorrente: item.recorrente ?? false,
          observacao: item.observacao,
        }])
        .select('*, categoria:categorias(*)')
        .single();

      if (error) {
        console.error('Erro ao adicionar lançamento:', error);
        // Rollback
        setLancamentos((prev) => prev.filter((l) => l.id !== tempId));
        return false;
      }
      if (data) {
        setLancamentos((prev) => prev.map((l) => (l.id === tempId ? data : l)));
      }
    }
    return true;
  };

  const updateLancamento = async (id: string, item: Partial<Lancamento>) => {
    const previous = [...lancamentos];
    startTransition(() => {
      setLancamentos((prev) =>
        prev.map((l) => {
          if (l.id === id) {
            const updated = { ...l, ...item };
            if (item.categoria_id) {
              updated.categoria = categorias.find((c) => c.id === item.categoria_id);
            }
            return updated;
          }
          return l;
        })
      );
    });

    if (isSupabaseConfigured && user) {
      const { error } = await supabase
        .from('lancamentos')
        .update(item)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar lançamento:', error);
        setLancamentos(previous);
        return false;
      }
    }
    return true;
  };

  const deleteLancamento = async (id: string) => {
    const itemToDelete = lancamentos.find((l) => l.id === id);
    if (!itemToDelete) return { success: false };

    setLastDeletedItem(itemToDelete);
    startTransition(() => {
      setLancamentos((prev) => prev.filter((l) => l.id !== id));
    });

    if (isSupabaseConfigured && user) {
      const { error } = await supabase.from('lancamentos').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar lançamento:', error);
        setLancamentos((prev) => [itemToDelete, ...prev]);
        return { success: false };
      }
    }
    return { success: true, undoneItem: itemToDelete };
  };

  const restoreLancamento = async (item: Lancamento) => {
    setLastDeletedItem(null);
    startTransition(() => {
      setLancamentos((prev) => [item, ...prev]);
    });

    if (isSupabaseConfigured && user) {
      const { error } = await supabase.from('lancamentos').insert([item]);
      if (error) {
        setLancamentos((prev) => prev.filter((l) => l.id !== item.id));
        return false;
      }
    }
    return true;
  };

  const updateMeta = async (newMetaData: Partial<Meta>) => {
    const updated = {
      ...(meta || INITIAL_META),
      ...newMetaData,
    };
    setMeta(updated);

    if (isSupabaseConfigured && user) {
      const { error } = await supabase.from('metas').upsert([updated]);
      if (error) {
        console.error('Erro ao salvar meta:', error);
        return false;
      }
    }
    return true;
  };

  const addProduto = async (prod: Omit<Produto, 'id' | 'user_id' | 'created_at'>) => {
    const tempId = 'prod-' + Date.now();
    const margin = prod.preco_venda > 0 ? ((prod.preco_venda - prod.custo_ingredientes) / prod.preco_venda) * 100 : 0;
    const newProd: Produto = {
      ...prod,
      id: tempId,
      user_id: user?.id || 'demo',
      margem_lucro_pct: margin,
      created_at: new Date().toISOString(),
    };

    setProdutos((prev) => [newProd, ...prev]);

    if (isSupabaseConfigured && user) {
      const { data, error } = await supabase
        .from('produtos')
        .insert([{
          user_id: user.id,
          nome: prod.nome,
          custo_ingredientes: prod.custo_ingredientes,
          preco_venda: prod.preco_venda,
          categoria: prod.categoria,
          ativo: prod.ativo ?? true,
        }])
        .select()
        .single();

      if (error) {
        setProdutos((prev) => prev.filter((p) => p.id !== tempId));
        return false;
      }
      if (data) {
        setProdutos((prev) => prev.map((p) => (p.id === tempId ? data : p)));
      }
    }
    return true;
  };

  const deleteProduto = async (id: string) => {
    const prev = [...produtos];
    setProdutos((p) => p.filter((x) => x.id !== id));

    if (isSupabaseConfigured && user) {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) {
        setProdutos(prev);
        return false;
      }
    }
    return true;
  };

  const clearLastDeleted = () => setLastDeletedItem(null);

  return (
    <FinanceContext.Provider
      value={{
        lancamentos,
        categorias,
        meta,
        produtos,
        loading,
        originsEntrada,
        originsSaida,
        addLancamento,
        updateLancamento,
        deleteLancamento,
        restoreLancamento,
        updateMeta,
        addProduto,
        deleteProduto,
        reload: fetchData,
        lastDeletedItem,
        clearLastDeleted,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);

