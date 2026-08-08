import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { Smartphone, CheckCircle, Clock, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface PaymentWaitingPageProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

export function PaymentWaitingPage({ orderId, onNavigate }: PaymentWaitingPageProps) {
  const { formatMT } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchOrderStatus = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data: Order = await res.json();
        setOrder(data);
        if (data.payment_status === 'Pago') {
          // Redirect automatically to success page
          onNavigate(`/pagamento/sucesso?order_id=${data.id}`);
        } else if (data.payment_status === 'Falhou') {
          onNavigate(`/pagamento/falhou?order_id=${data.id}`);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar estado do pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    const interval = setInterval(fetchOrderStatus, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleSimulatePaymentConfirm = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/payments/simulate-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onNavigate(`/pagamento/sucesso?order_id=${orderId}`);
      }
    } catch (err) {
      console.error('Erro ao simular confirmação:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>A carregar estado da solicitação...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Pedido não encontrado</h2>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-100"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-center">
      
      {/* Animated Waiting Banner */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
        
        <div className="relative w-20 h-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
          <Clock className="w-10 h-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full animate-ping"></span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Aguardando Confirmação
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Por favor, confirme no seu telemóvel
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Enviamos uma mensagem de autorização para o telemóvel <strong className="text-indigo-600">{order.customer_phone}</strong> via <strong className="uppercase">{order.payment_method}</strong>.
          </p>
        </div>

        {/* Order Details box */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="flex justify-between text-gray-500">
            <span>N.º do Pedido:</span>
            <span className="font-mono text-gray-900 font-bold">{order.id}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Produto:</span>
            <span className="font-bold text-gray-900 truncate max-w-[200px]">{order.product_name}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Cliente:</span>
            <span className="text-gray-800">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Conta Recetora Destino:</span>
            <strong className="text-indigo-600 font-mono font-bold">
              {order.receiving_account || (order.payment_method === 'mpesa' ? '841939698' : order.payment_method === 'emola' ? '867050958' : '841939698')} ({order.payment_method.toUpperCase()})
            </strong>
          </div>
          <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-200 text-sm font-bold">
            <span className="text-gray-700">Total a Pagar:</span>
            <span className="text-indigo-600">{formatMT(order.total)}</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-500">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          <span>A aguardar webhook de confirmação da gateway...</span>
        </div>

        {/* Test simulation button */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-[11px] text-gray-400 font-medium">
            (Ambiente de Demonstração / Testes)
          </p>
          <button
            onClick={handleSimulatePaymentConfirm}
            disabled={simulating}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-100 transition disabled:opacity-50"
          >
            {simulating ? 'A simular aprovação...' : '⚡ Simular Confirmação M-Pesa / Gateway Pago'}
          </button>
        </div>

      </div>

    </div>
  );
}
