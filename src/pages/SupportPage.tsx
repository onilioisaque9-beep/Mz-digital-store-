import React, { useState } from 'react';
import { Smartphone, Mail, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

interface SupportPageProps {
  onNavigate: (path: string) => void;
}

export function SupportPage({ onNavigate }: SupportPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSent, setContactSent] = useState(false);

  const faqs = [
    {
      q: 'Como recebo o produto após fazer o pagamento?',
      a: 'A entrega é 100% automática. Assim que efetuar o pagamento via M-Pesa, e-Mola, M-Kesh ou Cartão, a nossa gateway confirma a transação em menos de 5 segundos e liberta o botão de download na hora. Além disso, enviamos um link direto para o seu endereço de e-mail.'
    },
    {
      q: 'Quais são as formas de pagamento aceites em Moçambique?',
      a: 'Aceitamos as principais carteiras móveis do país: Vodacom M-Pesa (84/85), Movitel e-Mola (86/87), Tmcel M-Kesh (82/83) e cartões de débito/crédito Visa e Mastercard.'
    },
    {
      q: 'Posso ler os e-books e manuais no telemóvel?',
      a: 'Sim! Todos os nossos e-books e modelos estão em formatos PDF e Word perfeitamente otimizados para smartphones Android, iPhone, iPad, tablets e computadores.'
    },
    {
      q: 'O que acontece se eu perder o ficheiro do meu telemóvel?',
      a: 'Não se preocupe! O seu acesso é permanente. Pode aceder à secção "Meus produtos" na loja a qualquer altura para voltar a descarregar o produto sem qualquer custo adicional.'
    },
    {
      q: 'É seguro comprar na MZ Digital Store?',
      a: 'Totalmente seguro. Utilizamos encriptação de dados de nível bancário e integrações diretas de pagamentos autorizadas pelos operadores em Moçambique.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Apoio ao Cliente 🇲🇿
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Precisa de ajuda?
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Estamos aqui para ajudar. Entre em contacto conosco através do WhatsApp ou e-mail.
        </p>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* WhatsApp Direct Banner */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 space-y-6 shadow-xl shadow-gray-200/40">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-100">
            <Smartphone className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Atendimento Imediato via WhatsApp</h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Dúvidas sobre o produto, confirmação de pagamentos por M-Pesa ou ajuda com downloads? Resposta rápida da nossa equipa em Moçambique.
            </p>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Segunda a Sábado: 08:00 - 20:00 (Hora de Maputo)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Linha Oficial de Suporte Digital</span>
            </div>
          </div>

          <a
            href="https://wa.me/258833843119"
            target="_blank"
            rel="noreferrer"
            className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition"
          >
            <Smartphone className="w-5 h-5" />
            Falar no WhatsApp (+258 83 384 3119)
          </a>
        </div>

        {/* Email Contact Form */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-4 shadow-xl shadow-gray-200/40">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Enviar Mensagem por E-mail
          </h3>

          {contactSent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900">Mensagem Enviada!</h4>
              <p className="text-xs text-gray-600">
                Obrigado pelo contacto. Responderemos para o seu e-mail em menos de 2 horas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mabote Macamo"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Seu E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Assunto / Dúvida</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva aqui a sua dúvida..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs border border-gray-200 transition"
              >
                Enviar Mensagem
              </button>
            </form>
          )}
        </div>

      </div>

      {/* FAQ Section */}
      <div className="space-y-6 pt-6 border-t border-gray-100">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900">Perguntas Frequentes (FAQ)</h2>
          <p className="text-xs text-gray-500">Respostas rápidas para as dúvidas mais comuns dos nossos clientes em Moçambique.</p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-gray-800 flex items-center justify-between gap-4 hover:text-indigo-600"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
