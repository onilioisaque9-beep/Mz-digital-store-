import React from 'react';
import { ShieldCheck, Zap, Smartphone, MapPin, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

export function TrustBadges() {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: 'Pagamento Seguro',
      description: 'Transações encriptadas via M-Pesa, e-Mola, M-Kesh e Cartão',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      icon: Zap,
      title: 'Acesso Imediato',
      description: 'Envio automático do link de download assim que o pagamento é confirmado',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      icon: Smartphone,
      title: '100% no Telemóvel',
      description: 'Abra e leia os seus e-books e cursos em qualquer telemóvel Android ou iPhone',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      icon: MapPin,
      title: 'Feito para Moçambique 🇲🇿',
      description: 'Conteúdos focados no mercado local, leis moçambicanas e moeda Metical (MT)',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Escolha o produto',
      description: 'Navegue pelo catálogo e escolha o e-book, curso ou ferramenta ideal para si.'
    },
    {
      number: '2',
      title: 'Faça o pagamento',
      description: 'Pague rapidamente com M-Pesa, e-Mola, M-Kesh ou cartão sem complicação.'
    },
    {
      number: '3',
      title: 'Receba acesso imediatamente',
      description: 'O seu ficheiro é libertado na tela e enviado para o seu e-mail na hora.'
    }
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Guarantees Bar */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Porquê comprar na <span className="text-indigo-600">MZ Digital Store</span>?
            </h2>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              A maior e mais confiável plataforma de conteúdos digitais de Moçambique.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guarantees.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition group"
                >
                  <div className={`w-12 h-12 rounded-2xl border ${item.color} flex items-center justify-center mb-4 transition group-hover:scale-110 shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it Works Section */}
        <div className="pt-8 border-t border-gray-100">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-100">
              Passo a Passo
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
              Como funciona?
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Comprar conteúdos digitais em Moçambique nunca foi tão rápido e fácil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative bg-gray-50/80 rounded-3xl p-8 border border-gray-100 text-center flex flex-col items-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
