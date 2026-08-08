import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { AdminStats, Product, Order, Category, Coupon, Withdrawal } from '../types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  FolderTree,
  Settings,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Check,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  Wallet,
  Send,
  Lock,
  ShieldCheck,
  AlertCircle,
  MailCheck,
  Building2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  subSection?: string;
}

export function AdminDashboard({ onNavigate, subSection = 'overview' }: AdminDashboardProps) {
  const { user, formatMT, refreshProducts } = useStore();
  const [activeTab, setActiveTab] = useState<string>(subSection || 'overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);

  // Withdrawal State
  const [withdrawalData, setWithdrawalData] = useState<{
    total_revenue: number;
    total_withdrawn: number;
    available_balance: number;
    history: Withdrawal[];
  } | null>(null);

  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'emola'>('mpesa');
  const [withdrawAccount, setWithdrawAccount] = useState('841939698');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawCodeInput, setWithdrawCodeInput] = useState('');
  const [simulatedSentCode, setSimulatedSentCode] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [processingWithdraw, setProcessingWithdraw] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);

  // New Product Form State
  const [prodForm, setProdForm] = useState({
    name: '',
    short_description: '',
    description: '',
    price: '',
    old_price: '',
    category_id: 'cat-2',
    image_url: '',
    file_path: ''
  });

  // New Coupon Form State
  const [coupForm, setCoupForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '20',
    max_uses: '100'
  });

  // New Category Form State
  const [catName, setCatName] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resStats, resProds, resOrders, resCats, resCoups, resWithdraws] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/products'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/coupons'),
        fetch('/api/admin/withdrawals')
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resProds.ok) setProductsList(await resProds.json());
      if (resOrders.ok) setOrdersList(await resOrders.json());
      if (resCats.ok) setCategoriesList(await resCats.json());
      if (resCoups.ok) setCouponsList(await resCoups.json());
      if (resWithdraws.ok) setWithdrawalData(await resWithdraws.json());
    } catch (err) {
      console.error('Erro ao carregar dados admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleRequestWithdrawalCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setWithdrawError('Insira um valor de levantamento válido em Meticais.');
      return;
    }
    if (withdrawalData && amt > withdrawalData.available_balance) {
      setWithdrawError(`O valor excede o saldo disponível de ${formatMT(withdrawalData.available_balance)}.`);
      return;
    }

    try {
      setProcessingWithdraw(true);
      const res = await fetch('/api/admin/withdrawals/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_email: user?.email || 'saqueonilio@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSimulatedSentCode(data.simulatedCode || '');
        setShowWithdrawModal(true);
      } else {
        setWithdrawError(data.error || 'Erro ao enviar código de verificação.');
      }
    } catch (err) {
      setWithdrawError('Erro de ligação ao servidor.');
    } finally {
      setProcessingWithdraw(false);
    }
  };

  const handleConfirmWithdrawal = async () => {
    setWithdrawError('');
    if (!withdrawCodeInput) {
      setWithdrawError('Introduza o código de 6 dígitos enviado para o seu e-mail.');
      return;
    }

    try {
      setProcessingWithdraw(true);
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          method: withdrawMethod,
          account: withdrawAccount,
          admin_email: user?.email || 'saqueonilio@gmail.com',
          code: withdrawCodeInput
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawCodeInput('');
        setWithdrawSuccess(data.message);
        
        // Refresh withdrawal data
        const resW = await fetch('/api/admin/withdrawals');
        if (resW.ok) setWithdrawalData(await resW.json());
        fetchAdminData();
      } else {
        setWithdrawError(data.error || 'Erro ao confirmar levantamento.');
      }
    } catch (err) {
      setWithdrawError('Erro de ligação ao processar levantamento.');
    } finally {
      setProcessingWithdraw(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodForm)
      });
      if (res.ok) {
        setShowAddProductModal(false);
        setProdForm({
          name: '',
          short_description: '',
          description: '',
          price: '',
          old_price: '',
          category_id: 'cat-2',
          image_url: '',
          file_path: ''
        });
        fetchAdminData();
        refreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que pretende apagar este produto?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
        refreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProductActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !product.active })
      });
      if (res.ok) {
        fetchAdminData();
        refreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName })
      });
      if (res.ok) {
        setCatName('');
        setShowAddCategoryModal(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupForm)
      });
      if (res.ok) {
        setShowAddCouponModal(false);
        setCoupForm({ code: '', discount_type: 'percent', discount_value: '20', max_uses: '100' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter orders by search
  const filteredOrders = ordersList.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    );
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">Acesso Restrito ao Administrador</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Este painel e as opções de levantamento de dinheiro são de acesso exclusivo ao administrador da plataforma (<strong className="text-gray-700">saqueonilio@gmail.com</strong>).
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onNavigate('/minha-conta')}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition"
          >
            Ir para Minha Conta
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition shadow-md shadow-indigo-100"
          >
            Entrar como Administrador
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Painel Administrativo 👑
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            Gestão da MZ Digital Store
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Acompanhe vendas, gerencie produtos, pedidos, clientes e cupões de desconto.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 shadow-xs"
        >
          Ver Loja Pública ↗
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-gray-200">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'products', label: 'Produtos Digitais', icon: Package },
          { id: 'orders', label: 'Pedidos & Vendas', icon: ShoppingBag },
          { id: 'withdrawals', label: 'Levantamento de Dinheiro', icon: Wallet },
          { id: 'customers', label: 'Clientes', icon: Users },
          { id: 'categories', label: 'Categorias', icon: FolderTree },
          { id: 'coupons', label: 'Cupões', icon: Tag },
          { id: 'settings', label: 'Configuração Gateway', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-2 shadow-xl shadow-gray-200/40">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Receita Total (MT)</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-indigo-600">
                {formatMT(stats.totalRevenue)}
              </div>
              <div className="text-[11px] text-gray-400">Em vendas confirmadas</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-2 shadow-xl shadow-gray-200/40">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Vendas Hoje</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {formatMT(stats.salesToday)}
              </div>
              <div className="text-[11px] text-gray-400">
                Últimos 7d: {formatMT(stats.salesLast7Days)}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-2 shadow-xl shadow-gray-200/40">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Produtos Vendidos</span>
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {stats.totalProductsSold}
              </div>
              <div className="text-[11px] text-gray-400">Downloads autorizados</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-2 shadow-xl shadow-gray-200/40">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Pedidos Pendentes</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                {stats.pendingOrdersCount}
              </div>
              <div className="text-[11px] text-gray-400">Aguardando M-Pesa</div>
            </div>

          </div>

          {/* Chart Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xl shadow-gray-200/40">
            <h3 className="text-base font-bold text-gray-900 flex items-center justify-between">
              <span>Vendas nos Últimos 7 Dias (Meticais)</span>
              <span className="text-xs text-indigo-600 font-semibold">Total 30 dias: {formatMT(stats.salesLast30Days)}</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyChartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(val: any) => [`${val} MT`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xl shadow-gray-200/40">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Últimos Pedidos Recebidos</h3>
              <button onClick={() => setActiveTab('orders')} className="text-xs text-indigo-600 font-bold hover:underline">
                Ver todos os pedidos →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Pedido ID</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/60">
                      <td className="p-3 font-mono font-bold text-gray-900">{ord.id}</td>
                      <td className="p-3">{ord.customer_name} ({ord.customer_phone})</td>
                      <td className="p-3 truncate max-w-[200px]">{ord.product_name}</td>
                      <td className="p-3 font-bold text-indigo-600">{formatMT(ord.total)}</td>
                      <td className="p-3">
                        {ord.payment_status === 'Pago' ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Pago</span>
                        ) : (
                          <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Pendente</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {ord.payment_status === 'Pendente' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Pago')}
                            className="px-2.5 py-1 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition"
                          >
                            Aprovar Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: GERENCIAR PRODUTOS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Produtos Digitais ({productsList.length})</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Adicionar Novo Produto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsList.map((prod) => (
              <div key={prod.id} className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 flex flex-col justify-between shadow-xl shadow-gray-200/40">
                <div className="flex gap-4">
                  <img src={prod.image_url} alt={prod.name} className="w-16 h-20 object-cover rounded-2xl border border-gray-100 shrink-0" />
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${prod.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {prod.active ? 'Ativo na Loja' : 'Desativado'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{prod.name}</h3>
                    <div className="text-sm font-extrabold text-indigo-600">{formatMT(prod.price)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <button
                    onClick={() => handleToggleProductActive(prod)}
                    className="text-gray-500 hover:text-gray-900 font-semibold"
                  >
                    {prod.active ? 'Desativar' : 'Ativar'}
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">Novo Produto Digital</h3>

                <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      value={prodForm.name}
                      onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                      placeholder="Ex: Guia Prático de Negócios em MZ"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Preço (MT) *</label>
                      <input
                        type="number"
                        required
                        value={prodForm.price}
                        onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                        placeholder="249"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Preço Anterior (MT)</label>
                      <input
                        type="number"
                        value={prodForm.old_price}
                        onChange={(e) => setProdForm({ ...prodForm, old_price: e.target.value })}
                        placeholder="499"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Categoria *</label>
                    <select
                      value={prodForm.category_id}
                      onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600"
                    >
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Descrição Curta</label>
                    <input
                      type="text"
                      value={prodForm.short_description}
                      onChange={(e) => setProdForm({ ...prodForm, short_description: e.target.value })}
                      placeholder="Pequena síntese do produto..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Descrição Completa</label>
                    <textarea
                      rows={3}
                      value={prodForm.description}
                      onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                    >
                      Salvar Produto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GERENCIAR PEDIDOS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Pedidos Recebidos ({ordersList.length})</h2>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar cliente, e-mail, telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-full bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Pedido ID</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Método</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Data</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/60">
                      <td className="p-4 font-mono font-bold text-gray-900">{ord.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{ord.customer_name}</div>
                        <div className="text-[11px] text-gray-400">{ord.customer_email} • {ord.customer_phone}</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">{ord.product_name}</td>
                      <td className="p-4 font-bold text-indigo-600">{formatMT(ord.total)}</td>
                      <td className="p-4">
                        <span className="uppercase font-bold text-gray-800 block">{ord.payment_method}</span>
                        <span className="text-[10px] text-indigo-600 font-mono font-semibold">
                          Conta: {ord.receiving_account || (ord.payment_method === 'mpesa' ? '841939698' : ord.payment_method === 'emola' ? '867050958' : '841939698')}
                        </span>
                      </td>
                      <td className="p-4">
                        {ord.payment_status === 'Pago' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                            Pago ✓
                          </span>
                        ) : ord.payment_status === 'Pendente' ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                            Pendente
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                            Falhou
                          </span>
                        )}
                      </td>
                      <td className="p-4">{new Date(ord.created_at).toLocaleDateString('pt-MZ')}</td>
                      <td className="p-4 text-right">
                        {ord.payment_status === 'Pendente' ? (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Pago')}
                            className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-[11px] shadow-xs"
                          >
                            Aprovar
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
        </div>
      )}

      {/* TAB 4: CLIENTES */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Clientes Cadastrados</h2>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Compras</th>
                  <th className="p-4">Total Gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from(new Set(ordersList.map(o => o.customer_email))).map((email) => {
                  const custOrders = ordersList.filter(o => o.customer_email === email);
                  const first = custOrders[0];
                  const paidCustOrders = custOrders.filter(o => o.payment_status === 'Pago');
                  const totalSpent = paidCustOrders.reduce((s, o) => s + o.total, 0);

                  return (
                    <tr key={email} className="hover:bg-gray-50/60">
                      <td className="p-4 font-bold text-gray-900">{first?.customer_name || 'Cliente'}</td>
                      <td className="p-4">{email}</td>
                      <td className="p-4">{first?.customer_phone || '-'}</td>
                      <td className="p-4 font-bold">{paidCustOrders.length} produtos</td>
                      <td className="p-4 font-bold text-indigo-600">{formatMT(totalSpent)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CATEGORIAS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Categorias ({categoriesList.length})</h2>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100"
            >
              Nova Categoria
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoriesList.map((cat) => (
              <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-1 shadow-xs">
                <div className="font-bold text-gray-900 text-sm">{cat.name}</div>
                <div className="text-xs text-gray-400 font-mono">slug: {cat.slug}</div>
              </div>
            ))}
          </div>

          {showAddCategoryModal && (
            <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-gray-900">Adicionar Categoria</h3>
                <input
                  type="text"
                  placeholder="Nome da Categoria"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddCategoryModal(false)} className="px-3.5 py-1.5 bg-gray-100 text-xs text-gray-700 rounded-full font-semibold">Cancelar</button>
                  <button onClick={handleCreateCategory} className="px-4 py-1.5 bg-indigo-600 text-xs text-white font-bold rounded-full shadow-xs">Salvar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CUPÕES */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Cupões de Desconto ({couponsList.length})</h2>
            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100"
            >
              Criar Novo Cupão
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {couponsList.map((coup) => (
              <div key={coup.id} className="bg-white border border-gray-100 rounded-3xl p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-base font-mono font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {coup.code}
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    Desconto: {coup.discount_value}{coup.discount_type === 'percent' ? '%' : ' MT'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Utilizações: {coup.used_count} / {coup.max_uses}
                </div>
              </div>
            ))}
          </div>

          {showAddCouponModal && (
            <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-gray-900">Novo Cupão</h3>
                <input
                  type="text"
                  placeholder="Código (Ex: EMPREGO20)"
                  value={coupForm.code}
                  onChange={(e) => setCoupForm({ ...coupForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 uppercase focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="number"
                  placeholder="Valor do Desconto (% ou MT)"
                  value={coupForm.discount_value}
                  onChange={(e) => setCoupForm({ ...coupForm, discount_value: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddCouponModal(false)} className="px-3.5 py-1.5 bg-gray-100 text-xs text-gray-700 rounded-full font-semibold">Cancelar</button>
                  <button onClick={handleCreateCoupon} className="px-4 py-1.5 bg-indigo-600 text-xs text-white font-bold rounded-full shadow-xs">Salvar Cupão</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: CONFIGURAÇÕES GATEWAY */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-xl shadow-gray-200/40">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Configuração de Integração das Gateways de Pagamento
            </h2>
            <p className="text-xs text-gray-500">
              A arquitetura do sistema foi preparada para integração com ClicPay, PaySuite ou M-Pesa API oficial através de variáveis de ambiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 font-sans block text-[11px] uppercase font-bold">PAYMENT_API_KEY</span>
              <span className="text-indigo-600">{process.env.PAYMENT_API_KEY ? 'Configurado ✓' : 'Pronto para Chave Real'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 font-sans block text-[11px] uppercase font-bold">PAYMENT_SECRET_KEY</span>
              <span className="text-indigo-600">{process.env.PAYMENT_SECRET_KEY ? 'Configurado ✓' : 'Pronto para Secret Real'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 font-sans block text-[11px] uppercase font-bold">PAYMENT_WEBHOOK_SECRET</span>
              <span className="text-indigo-600">{process.env.PAYMENT_WEBHOOK_SECRET ? 'Configurado ✓' : 'Pronto para Webhook Secret'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
              <span className="text-gray-500 font-sans block text-[11px] uppercase font-bold">SUPABASE_URL</span>
              <span className="text-indigo-600">{process.env.SUPABASE_URL ? 'Configurado ✓' : 'In-Memory DB Ativo'}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: LEVANTAMENTO DE DINHEIRO (ADMIN ONLY) */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Acesso Exclusivo do Administrador (saqueonilio@gmail.com)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Painel de Levantamento de Dinheiro
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                Transfira o saldo das vendas diretamente para a sua conta <strong className="text-emerald-300">M-Pesa (841939698)</strong> ou <strong className="text-emerald-300">e-Mola (867050958)</strong> com confirmação de segurança via e-mail.
              </p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-emerald-300 pointer-events-none">
              <Wallet className="w-64 h-64" />
            </div>
          </div>

          {/* Balance Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 shadow-lg shadow-emerald-50 space-y-2 relative overflow-hidden">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Saldo Disponível
              </span>
              <div className="text-3xl font-extrabold text-emerald-900">
                {formatMT(withdrawalData?.available_balance || 0)}
              </div>
              <p className="text-[11px] text-gray-500">
                Livre para levantamento imediato via M-Pesa / e-Mola
              </p>
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 p-2.5 rounded-2xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md shadow-gray-200/40 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Total de Vendas Acumulado
              </span>
              <div className="text-2xl font-extrabold text-gray-900">
                {formatMT(withdrawalData?.total_revenue || 0)}
              </div>
              <p className="text-[11px] text-gray-500">
                Valor total recebido na plataforma
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md shadow-gray-200/40 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Total Já Levantado
              </span>
              <div className="text-2xl font-extrabold text-gray-700">
                {formatMT(withdrawalData?.total_withdrawn || 0)}
              </div>
              <p className="text-[11px] text-gray-500">
                Transferido para as suas contas bancárias/carteiras
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {withdrawSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{withdrawSuccess}</span>
            </div>
          )}

          {withdrawError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{withdrawError}</span>
            </div>
          )}

          {/* Withdrawal Request Form Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/40 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Solicitar Novo Levantamento
                </h3>
                <p className="text-xs text-gray-500">
                  Escolha o método, indique o valor e receba o código de autorização no seu e-mail.
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestWithdrawalCode} className="space-y-6">
              
              {/* Method Selector */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                  1. Selecione a Carteira de Recebimento
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawMethod('mpesa');
                      setWithdrawAccount('841939698');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition ${
                      withdrawMethod === 'mpesa'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-md shadow-emerald-100'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                      M-P
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Vodacom M-Pesa</span>
                      <span className="text-xs text-emerald-700 font-extrabold">Conta: 841939698</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawMethod('emola');
                      setWithdrawAccount('867050958');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition ${
                      withdrawMethod === 'emola'
                        ? 'border-amber-500 bg-amber-50/60 shadow-md shadow-amber-100'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                      e-M
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Movitel e-Mola</span>
                      <span className="text-xs text-amber-700 font-extrabold">Conta: 867050958</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Account Number & Amount Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                    Número do Telemóvel / Conta Destino
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder="841939698"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                    Valor a Levantar (MT Meticais)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Ex: 500"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-gray-400">
                      MT
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processingWithdraw || !withdrawAmount || Number(withdrawAmount) <= 0}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition"
                >
                  <MailCheck className="w-4 h-4" />
                  {processingWithdraw ? 'Enviando Código...' : 'Enviar Código de Verificação por E-mail'}
                </button>
              </div>

            </form>
          </div>

          {/* Withdrawals History Table */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/40 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">
              Histórico de Levantamentos Efetuados
            </h3>

            {withdrawalData?.history && withdrawalData.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-extrabold">
                      <th className="pb-3 px-2">ID</th>
                      <th className="pb-3 px-2">Data / Hora</th>
                      <th className="pb-3 px-2">Método</th>
                      <th className="pb-3 px-2">Conta Destino</th>
                      <th className="pb-3 px-2">E-mail Administrador</th>
                      <th className="pb-3 px-2">Valor</th>
                      <th className="pb-3 px-2">Estado</th>
                      <th className="pb-3 px-2">Referência</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {withdrawalData.history.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-2 font-mono font-bold text-gray-900">{w.id}</td>
                        <td className="py-3 px-2 text-gray-500">
                          {new Date(w.created_at).toLocaleString('pt-MZ')}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            w.method === 'mpesa' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {w.method === 'mpesa' ? 'Vodacom M-Pesa' : 'Movitel e-Mola'}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-gray-800">{w.account}</td>
                        <td className="py-3 px-2 text-gray-500">{w.admin_email}</td>
                        <td className="py-3 px-2 font-extrabold text-emerald-700">{formatMT(w.amount)}</td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-gray-400 text-[11px]">{w.gateway_reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-4">Nenhum levantamento efetuado até ao momento.</p>
            )}
          </div>

          {/* EMAIL VERIFICATION CODE MODAL */}
          {showWithdrawModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
                
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Confirmação de Segurança
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Para autorizar o levantamento de <strong>{formatMT(Number(withdrawAmount))}</strong> para a conta <strong>{withdrawAccount}</strong>, digite o código de 6 dígitos enviado para:
                  </p>
                  <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 inline-block">
                    saqueonilio@gmail.com
                  </p>
                </div>

                {/* Simulated Email Code Notification Banner */}
                {simulatedSentCode && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
                    <span className="font-extrabold block flex items-center gap-1">
                      <MailCheck className="w-4 h-4 text-amber-600" />
                      Simulação de E-mail de Segurança:
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Código de verificação gerado: <strong className="text-xs font-mono font-bold text-black bg-white px-2 py-0.5 rounded border border-amber-300">{simulatedSentCode}</strong>
                    </p>
                  </div>
                )}

                {withdrawError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                    {withdrawError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2 text-center">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={withdrawCodeInput}
                    onChange={(e) => setWithdrawCodeInput(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono tracking-widest font-extrabold px-4 py-3 rounded-2xl border-2 border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmWithdrawal}
                    disabled={processingWithdraw || !withdrawCodeInput}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-200 transition"
                  >
                    {processingWithdraw ? 'Processando...' : 'Confirmar Levantamento'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
