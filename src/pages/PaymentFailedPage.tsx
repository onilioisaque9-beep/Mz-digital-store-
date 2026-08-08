import React from 'react';
import { AlertCircle, RefreshCw, Smartphone, ArrowLeft } from 'lucide-react';

interface PaymentFailedPageProps {
  orderId?: string;
  onNavigate: (path: string) => void;
}

export function PaymentFailedPage({ orderId, onNavigate }: PaymentFailedPageProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-md">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          Pagamento Não Concluído
        </span>
        <h1 className="text-2xl font-extrabold text-gray-900">
          A transação falhou ou foi cancelada
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          O pedido de pagamento M-Pesa / e-Mola foi rejeitado no telemóvel, o PIN inserido foi incorreto ou o tempo limite expirou.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 text-xs text-left shadow-xl shadow-gray-200/40">
        <h4 className="font-bold text-gray-900">Como tentar novamente:</h4>
        <ul className="space-y-1.5 text-gray-600 list-disc list-inside">
          <li>Verifique se possui saldo suficiente na sua conta M-Pesa/e-Mola.</li>
          <li>Garanta que o telemóvel está ligado e com rede ativa.</li>
          <li>Certifique-se de digitar o PIN correto no telemóvel.</li>
        </ul>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={() => onNavigate('/checkout')}
          className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-100"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Pagamento Novamente
        </button>

        <a
          href="https://wa.me/258833843119"
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs flex items-center justify-center gap-2 border border-gray-200 transition"
        >
          <Smartphone className="w-4 h-4 text-indigo-600" />
          Pedir Ajuda no WhatsApp
        </a>
      </div>

    </div>
  );
}
