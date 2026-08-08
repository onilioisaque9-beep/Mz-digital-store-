import React from 'react';
import { Smartphone, Mail, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100">
                MZ
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                MZ Digital Store
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A sua loja de confiança para e-books, guias profissionais, cursos e recursos digitais em Moçambique.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl w-fit font-medium">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Empresa e Plataforma Registada
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition">
                  Página Inicial
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/produtos')} className="hover:text-indigo-600 transition">
                  Todos os Produtos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/minha-conta')} className="hover:text-indigo-600 transition">
                  Meus Produtos & Downloads
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/suporte')} className="hover:text-indigo-600 transition">
                  Apoio ao Cliente & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              Métodos de Pagamento
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Aceitamos pagamentos moçambicanos instantâneos:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center gap-2 text-xs text-gray-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                M-Pesa (Vodacom)
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center gap-2 text-xs text-gray-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                e-Mola (Movitel)
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center gap-2 text-xs text-gray-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                M-Kesh (Tmcel)
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center gap-2 text-xs text-gray-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Visa / Mastercard
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              Suporte & Dúvidas
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>WhatsApp: +258 83 384 3119</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>saqueonilio@gmail.com</span>
              </div>
              <a
                href="https://wa.me/258833843119"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs mt-2 transition shadow-md shadow-indigo-100"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} MZ Digital Store. Todos os direitos reservados. Moçambique 🇲🇿</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/suporte')} className="hover:text-gray-600">
              Termos de Uso
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('/suporte')} className="hover:text-gray-600">
              Política de Privacidade
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('/admin')} className="text-gray-400 hover:text-indigo-600">
              Área Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
