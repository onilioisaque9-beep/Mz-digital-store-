import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { User, ShoppingBag, Download, Key, Search, FileText, CheckCircle2, Clock, Smartphone, AlertCircle } from 'lucide-react';

interface MyAccountPageProps {
  onNavigate: (path: string) => void;
}

export function MyAccountPage({ onNavigate }: MyAccountPageProps) {
  const { user, formatMT, login, updateProfile } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');

  const [searchEmail, setSearchEmail] = useState(user?.email || '');
  const [searchPhone, setSearchPhone] = useState(user?.phone || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Profile form local state
  const [profName, setProfName] = useState(user?.name || '');
  const [profEmail, setProfEmail] = useState(user?.email || '');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [profAge, setProfAge] = useState(user?.age ? String(user.age) : '');
  const [profGender, setProfGender] = useState(user?.gender || 'Masculino');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchUserOrders = async (email: string, phone: string) => {
    if (!email && !phone) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setSearched(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserOrders(user.email, user.phone || '');
    }
  }, [user]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUserOrders(searchEmail, searchPhone);
    if (!user && searchEmail) {
      login(searchEmail, searchEmail.split('@')[0], searchPhone, 'customer');
    }
  };

  const paidOrders = orders.filter((o) => o.payment_status === 'Pago');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Área do Cliente
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Minha Conta & Downloads
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Aceda aos seus e-books, manuais e histórico de compras em Moçambique.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-gray-900">{user.name}</div>
              <div className="text-gray-500">{user.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Lookup Card if no user or searching */}
      {!user && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-gray-200/40">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Procurar as Minhas Compras
            </h3>
            <p className="text-xs text-gray-500">
              Introduza o seu e-mail ou número de telefone utilizado durante a compra para consultar os seus produtos digitais.
            </p>
          </div>

          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="email"
              placeholder="Seu E-mail de Compra"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            <input
              type="tel"
              placeholder="Telefone (M-Pesa / e-Mola)"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-100"
            >
              {loading ? 'A pesquisar...' : 'Aceder aos Meus Produtos'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Meus Produtos ({paidOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Minhas Compras ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          Perfil & Dados Pessoais
        </button>
      </div>

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {paidOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paidOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xl shadow-gray-200/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        Acesso Ativo
                      </span>
                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {order.product_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Comprado em {new Date(order.created_at).toLocaleDateString('pt-MZ')} • {formatMT(order.total)}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-indigo-600 shrink-0" />
                  </div>

                  <div className="pt-2">
                    {order.download_token ? (
                      <a
                        href={`/api/downloads/file/${order.download_token}`}
                        download
                        className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-100"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Ficheiro
                      </a>
                    ) : (
                      <span className="text-xs text-rose-500 font-semibold">Download indisponível</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-3 shadow-xl shadow-gray-200/40">
              <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Nenhum produto adquirido ainda</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore a nossa loja para adquirir o seu primeiro e-book ou guia digital.
              </p>
              <button
                onClick={() => onNavigate('/produtos')}
                className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100"
              >
                Ver Produtos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-4">Pedido ID</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Pagamento</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Data</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition">
                        <td className="p-4 font-mono font-bold text-gray-900">{order.id}</td>
                        <td className="p-4 font-semibold text-gray-800">{order.product_name}</td>
                        <td className="p-4 font-bold text-indigo-600">{formatMT(order.total)}</td>
                        <td className="p-4 uppercase">{order.payment_method}</td>
                        <td className="p-4">
                          {order.payment_status === 'Pago' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              Pago ✓
                            </span>
                          ) : order.payment_status === 'Pendente' ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                              Pendente
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                              Falhou
                            </span>
                          )}
                        </td>
                        <td className="p-4">{new Date(order.created_at).toLocaleDateString('pt-MZ')}</td>
                        <td className="p-4 text-right">
                          {order.payment_status === 'Pago' && order.download_token ? (
                            <a
                              href={`/api/downloads/file/${order.download_token}`}
                              download
                              className="text-indigo-600 hover:underline font-bold"
                            >
                              Baixar
                            </a>
                          ) : order.payment_status === 'Pendente' ? (
                            <button
                              onClick={() => onNavigate(`/pagamento/aguardando?order_id=${order.id}`)}
                              className="text-amber-600 hover:underline font-bold"
                            >
                              Concluir
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 text-xs shadow-xl shadow-gray-200/40">
              Nenhum pedido registado para esta conta.
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Profile & Personal Data */}
      {activeTab === 'profile' && user && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-gray-200/40 max-w-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Perfil & Dados Pessoais do Cliente</h3>
              <p className="text-xs text-gray-500">Mantenha as suas informações atualizadas para a emissão de recibos e downloads.</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Cliente Registado ✓
            </span>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Dados do perfil atualizados com sucesso!</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile({
                name: profName,
                email: profEmail,
                phone: profPhone,
                age: profAge ? parseInt(profAge, 10) : undefined,
                gender: profGender
              });
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 4000);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-gray-700 font-bold mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Endereço de E-mail</label>
              <input
                type="email"
                required
                value={profEmail}
                onChange={(e) => setProfEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Número Legal de Moçambique</label>
              <input
                type="tel"
                required
                value={profPhone}
                onChange={(e) => setProfPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Número Vodacom (84/85), Movitel (86/87) ou Tmcel (82/83).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Idade (Anos)</label>
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={profAge}
                  onChange={(e) => setProfAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Gênero</label>
                <select
                  value={profGender}
                  onChange={(e) => setProfGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none appearance-none"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não dizer">Prefiro não dizer</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition shadow-md shadow-indigo-100"
            >
              Guardar Alterações do Perfil
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
