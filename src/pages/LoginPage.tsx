import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Lock, Mail, Smartphone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier) {
      setErrorMsg('Por favor introduza o seu e-mail ou número de telefone.');
      return;
    }

    if (isAdminLogin) {
      const adminEmail = identifier.includes('@') ? identifier : 'saqueonilio@gmail.com';
      login(adminEmail, 'Administrador MZ Digital', '+258 84 193 9698', 'admin');
      onNavigate('/admin');
      return;
    }

    // Customer login
    let userEmail = identifier;
    let userPhone = '+258 84 123 4567';

    const isPhone = /^(?:\+258\s?|258\s?)?(8[234567]\d{7})$/.test(identifier.replace(/\D/g, ''));
    if (isPhone) {
      const digits = identifier.replace(/\D/g, '');
      const cleanPhone = digits.startsWith('258') ? digits.slice(3) : digits;
      userPhone = `+258 ${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5)}`;
      userEmail = `cliente.${cleanPhone}@mzdigital.co.mz`;
    } else if (!identifier.includes('@')) {
      setErrorMsg('Por favor introduza um e-mail válido ou um número de telefone legal de Moçambique (ex: 841234567).');
      return;
    }

    login(userEmail, userEmail.split('@')[0], userPhone, 'customer');
    onNavigate('/minha-conta');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Entrar na Sua Conta</h1>
        <p className="text-xs text-gray-500">
          Aceda aos seus e-books e histórico de compras.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl shadow-gray-200/40">
        
        {/* Toggle Login Mode */}
        <div className="flex bg-gray-50 p-1 rounded-full border border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-full transition ${
              !isAdminLogin ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(true);
              setIdentifier('saqueonilio@gmail.com');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-full transition ${
              isAdminLogin ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Administrador 👑
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">
              {isAdminLogin ? 'E-mail do Administrador' : 'E-mail ou Número Legal de Moçambique'}
            </label>
            <div className="relative">
              {isAdminLogin ? (
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                type="text"
                required
                placeholder={isAdminLogin ? 'saqueonilio@gmail.com' : 'exemplo@gmail.com ou 841234567'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            {!isAdminLogin && (
              <span className="text-[10px] text-gray-400 mt-1 block">
                Pode usar o seu e-mail ou o número 84/85/86/87 utilizado na compra.
              </span>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Palavra-passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-full font-extrabold text-white flex items-center justify-center gap-2 transition shadow-lg ${
              isAdminLogin ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            <span>{isAdminLogin ? 'Entrar no Painel Admin' : 'Entrar na Conta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Ainda não registou a sua conta?{' '}
          <button onClick={() => onNavigate('/registo')} className="text-indigo-600 hover:underline font-bold">
            Criar Registo
          </button>
        </div>

      </div>

    </div>
  );
}

