import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Cake, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, isConfigured } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = isRegister
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setErrorMsg(error.message || 'Erro ao realizar login.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xl shadow-pink-500/20 transform hover:scale-105 transition-transform">
            <Cake size={40} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Doces da Luana
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Controle e Gestão Financeira Inteligente
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 space-y-5">
          {!isConfigured && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>
                Demonstração pronta para teste! Você pode entrar com qualquer e-mail ou adicionar sua chave no <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">.env</code>.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-600 dark:text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="email"
                  placeholder="luana@docesdaluana.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 ios-active transition-all"
            >
              <span>{loading ? 'Entrando...' : isRegister ? 'Criar Conta' : 'Acessar App'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            >
              {isRegister
                ? 'Já tem conta? Clique para entrar'
                : 'Novo usuário? Cadastre-se com seu e-mail'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
