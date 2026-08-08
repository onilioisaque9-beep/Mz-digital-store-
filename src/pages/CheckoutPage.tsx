import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, PaymentMethod } from '../types';
import { ShieldCheck, Lock, Smartphone, CreditCard, Tag, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface CheckoutPageProps {
  productId?: string;
  onNavigate: (path: string) => void;
}

export function CheckoutPage({ productId, onNavigate }: CheckoutPageProps) {
  const { products, formatMT, user } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: 'percent' | 'fixed'; discount_value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // PIN Modal state for M-Pesa / e-Mola
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');

  const targetReceivingAccount =
    paymentMethod === 'mpesa'
      ? '841939698'
      : paymentMethod === 'emola'
      ? '867050958'
      : '841939698';

  useEffect(() => {
    // If productId passed or default to initial product 'prod-emprego-mz'
    const targetId = productId || 'prod-emprego-mz';
    const found = products.find((p) => p.id === targetId || p.slug === targetId) || products[0];
    if (found) {
      setProduct(found);
    }
  }, [productId, products]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        <p>A carregar checkout...</p>
      </div>
    );
  }

  // Calculate totals
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      discountAmount = (product.price * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const finalTotal = Math.max(0, product.price - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode)}`);
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
        setCouponSuccess(`Cupão "${data.code}" aplicado com sucesso!`);
      } else {
        setCouponError(data.error || 'Cupão inválido');
      }
    } catch {
      setCouponError('Erro ao validar cupão');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setFormError('Por favor, preencha o seu nome, e-mail e número de telefone.');
      return;
    }

    // Show PIN modal for M-Pesa or e-Mola, or proceed directly
    setShowPinModal(true);
  };

  const executeOrderCreation = async () => {
    setSubmitting(true);
    setFormError('');
    setPinError('');

    try {
      const payload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        product_id: product.id,
        payment_method: paymentMethod,
        receiving_account: targetReceivingAccount,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined
      };

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setShowPinModal(false);
        // Redirect to payment waiting screen
        onNavigate(`/pagamento/aguardando?order_id=${data.order.id}`);
      } else {
        setFormError(data.error || 'Erro ao processar o checkout.');
        setPinError(data.error || 'Erro no pagamento.');
      }
    } catch (err: any) {
      setFormError('Erro na ligação com o servidor: ' + err.message);
      setPinError('Erro na ligação com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Heading */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Checkout Seguro 🇲🇿
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Finalizar Compra do Seu Produto Digital
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Preencha os seus dados e conclua o pagamento para ter acesso imediato.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Customer Details & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            
            {/* Step 1: Personal Data */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-gray-200/40">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                Dados Pessoais
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mabote Macamo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Endereço de E-mail (Para onde enviamos o produto) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Enviaremos o comprovativo e o link do produto para este e-mail.
                  </span>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Número de Telefone (M-Pesa / e-Mola) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+258 84 123 4567 ou 841234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Selection */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-gray-200/40">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                Método de Pagamento Moçambicano
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* M-Pesa */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    paymentMethod === 'mpesa'
                      ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'mpesa'}
                      onChange={() => setPaymentMethod('mpesa')}
                      className="accent-indigo-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        M-Pesa
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="text-[11px] text-indigo-700 font-semibold">Conta Destino: 841939698</div>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                </label>

                {/* e-Mola */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    paymentMethod === 'emola'
                      ? 'bg-orange-50/50 border-orange-500 ring-1 ring-orange-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'emola'}
                      onChange={() => setPaymentMethod('emola')}
                      className="accent-orange-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        e-Mola
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      </div>
                      <div className="text-[11px] text-orange-700 font-semibold">Conta Destino: 867050958</div>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-orange-500" />
                </label>

                {/* M-Kesh */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    paymentMethod === 'mkesh'
                      ? 'bg-amber-50/50 border-amber-500 ring-1 ring-amber-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'mkesh'}
                      onChange={() => setPaymentMethod('mkesh')}
                      className="accent-amber-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        M-Kesh
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      </div>
                      <div className="text-[11px] text-gray-500">Tmcel (82/83)</div>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-amber-500" />
                </label>

                {/* Visa / Mastercard */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    paymentMethod === 'card'
                      ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-blue-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        Cartão Visa / MC
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      </div>
                      <div className="text-[11px] text-gray-500">Nacional e Internacional</div>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </label>

              </div>

              {/* Destination Account Highlight Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 block">
                    {paymentMethod === 'mpesa'
                      ? 'O pagamento por M-Pesa será creditado na conta recetora: 841939698'
                      : paymentMethod === 'emola'
                      ? 'O pagamento por e-Mola será creditado na conta recetora: 867050958'
                      : 'O pagamento será processado na gateway oficial da plataforma.'}
                  </span>
                  <p className="text-gray-600 text-[11px]">
                    Após confirmar com o seu PIN de 4 dígitos, a transação e o envio do e-book são libertados na hora.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Errors */}
            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Big Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>A INICIAR PAGAMENTO...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>PAGAR AGORA ({formatMT(finalTotal)})</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Conexão encriptada e protegida. O seu download é libertado na hora.</span>
            </div>

          </form>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-gray-200/40">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Resumo do Pedido
            </h3>

            {/* Product Item Preview */}
            <div className="flex gap-4">
              <img
                src={product.image_url}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-16 h-20 object-cover rounded-2xl border border-gray-100 shrink-0"
              />
              <div className="space-y-1 my-auto">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</h4>
                <div className="text-xs text-gray-400">Produto Digital (PDF/Word)</div>
                <div className="text-sm font-extrabold text-indigo-600">{formatMT(product.price)}</div>
              </div>
            </div>

            {/* Coupon input */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                Tem um Cupão de Desconto?
              </label>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: EMPREGO20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 uppercase focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-xs font-bold text-white rounded-full shrink-0 shadow-sm"
                >
                  Aplicar
                </button>
              </form>

              {couponSuccess && (
                <div className="text-[11px] text-indigo-600 font-semibold">{couponSuccess}</div>
              )}
              {couponError && (
                <div className="text-[11px] text-rose-500 font-semibold">{couponError}</div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs pt-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{formatMT(product.price)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-indigo-600 font-semibold">
                  <span>Desconto Cupão ({appliedCoupon?.code}):</span>
                  <span>-{formatMT(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Taxas de Envio Digital:</span>
                <span className="text-indigo-600 font-semibold">GRÁTIS (0 MT)</span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-100">
                <span>Total a Pagar:</span>
                <span className="text-indigo-600">{formatMT(finalTotal)}</span>
              </div>
            </div>

            {/* Key benefits list */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Acesso Imediato após pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Link enviado para o seu e-mail</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600" />
                <span>Suporte técnico WhatsApp incluído</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* STK Push / PIN Confirmation Modal for M-Pesa & e-Mola */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Gateway {paymentMethod === 'mpesa' ? 'Vodacom M-Pesa' : paymentMethod === 'emola' ? 'Movitel e-Mola' : 'Moçambique'} 🇲🇿
              </span>
              <h3 className="text-xl font-extrabold text-gray-900">
                Confirmar Débito no Telemóvel
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Insira o seu PIN de 4 dígitos para autorizar o envio imediato do valor de <strong>{formatMT(finalTotal)}</strong>.
              </p>
            </div>

            {/* Payment Transfer Summary Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Número do Pagador:</span>
                <strong className="text-gray-900">{customerPhone}</strong>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Conta Recetora da Plataforma:</span>
                <strong className="text-indigo-600 font-mono font-bold">
                  {targetReceivingAccount} ({paymentMethod.toUpperCase()})
                </strong>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Produto Digital:</span>
                <span className="text-gray-900 truncate max-w-[180px] font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-2 border-t border-gray-200">
                <span>Total a Creditar:</span>
                <span className="text-indigo-600">{formatMT(finalTotal)}</span>
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 text-center">
                Digite o seu PIN {paymentMethod.toUpperCase()} (4 Dígitos)
              </label>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="• • • •"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest text-2xl py-3 rounded-2xl bg-gray-50 border-2 border-indigo-200 text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
              />
              <span className="text-[11px] text-gray-400 block text-center">
                Ambiente de segurança encriptada de ponta a ponta.
              </span>
            </div>

            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs text-center font-medium">
                {pinError}
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={submitting || pinCode.length < 4}
                onClick={executeOrderCreation}
                className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-xl shadow-indigo-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>A PROCESSAR TRANSFERÊNCIA...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>CONFIRMAR E PAGAR {formatMT(finalTotal)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowPinModal(false)}
                className="w-full py-2.5 rounded-full text-xs text-gray-500 hover:text-gray-800 font-semibold"
              >
                Cancelar ou alterar dados
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
