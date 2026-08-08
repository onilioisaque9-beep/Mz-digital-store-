import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Mail, Smartphone, Lock, ArrowRight, ShieldCheck, Calendar, UserCheck, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { login } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Masculino');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to detect operator for Mozambican numbers
  const getOperatorBadge = (numStr: string) => {
    const digits = numStr.replace(/\D/g, '');
    let mainDigits = digits;
    if (digits.startsWith('258')) mainDigits = digits.slice(3);
    if (mainDigits.length >= 2) {
      const prefix = mainDigits.slice(0, 2);
      if (prefix === '84' || prefix === '85') return { name: 'Vodacom (M-Pesa)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      if (prefix === '86' || prefix === '87') return { name: 'Movitel (e-Mola)', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      if (prefix === '82' || prefix === '83') return { name: 'Tmcel (M-Kesh)', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validate Mozambican legal phone number
    const digits = phone.replace(/\D/g, '');
    let cleanPhone = digits;
    if (digits.startsWith('258')) cleanPhone = digits.slice(3);

    if (cleanPhone.length !== 9 || !/^(82|83|84|85|86|87)/.test(cleanPhone)) {
      setErrorMsg('Por favor, introduza um número legal válido de Moçambique (Vodacom 84/85, Movitel 86/87 ou Tmcel 82/83 com 9 dígitos).');
      return;
    }

    const formattedPhone = `+258 ${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5)}`;
    const numAge = age ? parseInt(age, 10) : undefined;

    login(email, name, formattedPhone, 'customer', numAge, gender);
    onNavigate('/minha-conta');
  };

  const operator = getOperatorBadge(phone);

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Criar Nova Conta de Cliente</h1>
        <p className="text-xs text-gray-500">
          Registe-se com o seu número legal de Moçambique para aceder e descarregar os seus e-books.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl shadow-gray-200/40">
        
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Nome Completo *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: Mabote Macamo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Endereço de E-mail *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="seu.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Legal Mozambique Phone */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-700 font-bold">Número Legal de Moçambique *</label>
              {operator && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${operator.color}`}>
                  {operator.name}
                </span>
              )}
            </div>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="841234567 ou 867050958"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Prefixos legais aceites: 84, 85 (Vodacom), 86, 87 (Movitel) ou 82, 83 (Tmcel).
            </span>
          </div>

          {/* Age and Gender Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Idade (Anos)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={14}
                  max={100}
                  placeholder="Ex: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Gênero</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white appearance-none"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não dizer">Prefiro não dizer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Palavra-passe *</label>
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
            className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-100"
          >
            <span>Criar Minha Conta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Já tem conta registada?{' '}
          <button onClick={() => onNavigate('/login')} className="text-indigo-600 hover:underline font-bold">
            Entrar Agora
          </button>
        </div>

      </div>

    </div>
  );
}

