import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { CheckCircle2, Download, Mail, ShieldCheck, ArrowRight, FileText, Smartphone } from 'lucide-react';

interface PaymentSuccessPageProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

export function PaymentSuccessPage({ orderId, onNavigate }: PaymentSuccessPageProps) {
  const { formatMT } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setOrder(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        <p>A verificar o seu pagamento...</p>
      </div>
    );
  }

  // Security check: Must strictly be paid
  if (!order || order.payment_status !== 'Pago') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pagamento Pendente ou Não Confirmado</h2>
        <p className="text-gray-500 text-xs">
          O seu pagamento ainda não foi confirmado pela gateway. O produto só é libertado após validação real.
        </p>
        <button
          onClick={() => onNavigate(`/pagamento/aguardando?order_id=${orderId}`)}
          className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100"
        >
          Voltar ao Estado da Transação
        </button>
      </div>
    );
  }

  const downloadUrl = order.download_token
    ? `/api/downloads/file/${order.download_token}`
    : '#';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-center">
      
      {/* Success Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl shadow-gray-200/50">
        
        {/* Animated Checkmark Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-200 transform hover:scale-105 transition">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Pagamento confirmado! 🎉
          </h1>
          <p className="text-lg text-emerald-600 font-bold">
            Obrigado pela sua compra.
          </p>
          <p className="text-gray-500 text-sm">
            Seu produto está disponível para acesso imediato.
          </p>
        </div>

        {/* Download Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{order.product_name}</h3>
              <p className="text-xs text-gray-400">Formato Digital Protegido (PDF/Word)</p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download
            className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition transform active:scale-98"
          >
            <Download className="w-5 h-5" />
            BAIXAR MEU PRODUTO
          </a>
        </div>

        {/* Mail notification reassurance */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600 flex items-center gap-3 text-left">
          <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="font-semibold text-gray-900 block">Aviso enviado por E-mail</span>
            <span>Um link seguro de acesso também foi enviado para <strong>{order.customer_email}</strong>.</span>
          </div>
        </div>

        {/* Receipt summary */}
        <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Pedido: <strong className="text-gray-800 font-mono">{order.id}</strong></span>
          <span>Método: <strong className="text-gray-800 uppercase">{order.payment_method}</strong> ({order.receiving_account || (order.payment_method === 'mpesa' ? '841939698' : order.payment_method === 'emola' ? '867050958' : '841939698')})</span>
          <span>Total: <strong className="text-indigo-600">{formatMT(order.total)}</strong></span>
        </div>

        {/* My Account CTA */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate('/minha-conta')}
            className="text-xs text-gray-500 hover:text-indigo-600 underline font-medium"
          >
            Ver todas as minhas compras na Área de Cliente
          </button>
        </div>

      </div>

    </div>
  );
}
