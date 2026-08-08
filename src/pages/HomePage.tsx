import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { TrustBadges } from '../components/TrustBadges';
import { ArrowRight, BookOpen, Sparkles, CheckCircle, ShieldCheck, HelpCircle, Smartphone } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { products, categories, activeCategory, setActiveCategory, formatMT } = useStore();

  const primaryProduct = products.find(p => p.id === 'prod-emprego-mz') || products[0];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_id === activeCategory);

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 via-white to-white pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Loja N.º 1 de Produtos Digitais em Moçambique 🇲🇿
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Produtos digitais que ajudam você a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  aprender, trabalhar e ganhar mais.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Acesse e-books, cursos, guias e ferramentas digitais criados para facilitar a sua vida em Moçambique. Pagamento instantâneo via M-Pesa, e-Mola e Cartão com download imediato.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/produtos')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  Ver produtos
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onNavigate('/produto/preparado-para-o-emprego-mz')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-gray-700 hover:bg-gray-50 font-semibold text-base border border-gray-200 transition shadow-xs flex items-center justify-center gap-2"
                >
                  ⭐ Produto em Destaque (249 MT)
                </button>
              </div>

              {/* Quick stats / reassurance */}
              <div className="pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">100% Digital</div>
                  <div className="text-xs text-gray-500">Download no telemóvel</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-600">0 Segundos</div>
                  <div className="text-xs text-gray-500">Acesso automático</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">M-Pesa / e-Mola</div>
                  <div className="text-xs text-gray-500">Pagamento local MT</div>
                </div>
              </div>
            </div>

            {/* Hero Image / Banner */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 group">
                <img
                  src="/src/assets/images/hero_banner_mz_1786135860983.jpg"
                  alt="MZ Digital Store Banner"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent"></div>
                
                {/* Floating highlight card */}
                {primaryProduct && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-100 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        Top Recomendado 🇲🇿
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{primaryProduct.name}</h4>
                      <p className="text-xs text-indigo-600 font-extrabold">{formatMT(primaryProduct.price)}</p>
                    </div>
                    <button
                      onClick={() => onNavigate(`/produto/${primaryProduct.slug}`)}
                      className="px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow-md shadow-indigo-100"
                    >
                      Comprar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Primary Featured Product Highlight Section */}
      {primaryProduct && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white font-extrabold text-xs px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              Lançamento Oficial Moçambique
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Product Cover */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-gray-100 group">
                  <img
                    src={primaryProduct.image_url}
                    alt={primaryProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/95 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-100 shadow-xs">
                    PDF + Ficheiros Word Editáveis
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="md:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  E-book & Kit Guia de Carreira
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
                  {primaryProduct.name}
                </h2>

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {primaryProduct.short_description}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Modelos de Currículo Profissional Editáveis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Cartas de Candidatura para RHs em MZ</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Guia de Entrevistas Presenciais e Online</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Acesso Imediato após Pagamento</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div>
                    <div className="text-xs text-gray-400">Preço Especial em Meticais:</div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-gray-900">
                        {formatMT(primaryProduct.price)}
                      </span>
                      {primaryProduct.old_price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatMT(primaryProduct.old_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(`/produto/${primaryProduct.slug}`)}
                    className="sm:ml-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition transform active:scale-95"
                  >
                    COMPRAR AGORA (249 MT)
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* Catalog Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Produtos Digitais em Destaque
            </h2>
            <p className="mt-1 text-gray-500 text-sm">
              E-books, manuais e ferramentas desenvolvidas para o mercado moçambicano.
            </p>
          </div>

          {/* Categories Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              featured={prod.id === 'prod-emprego-mz'}
            />
          ))}
        </div>

      </section>

      {/* Trust Badges & Step Process */}
      <TrustBadges />

      {/* Support & Direct WhatsApp CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-gray-200/40">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <HelpCircle className="w-7 h-7" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Precisa de ajuda ou tem alguma dúvida?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Nossa equipe de suporte técnico está pronta para te atender diretamente pelo WhatsApp em Moçambique.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="https://wa.me/258833843119"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 transition"
            >
              <Smartphone className="w-5 h-5" />
              Falar no WhatsApp
            </a>

            <button
              onClick={() => onNavigate('/suporte')}
              className="px-6 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm border border-gray-200 transition"
            >
              Ver Perguntas Frequentes (FAQ)
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
