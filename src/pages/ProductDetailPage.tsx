import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { CheckCircle2, ShieldCheck, Zap, HelpCircle, ArrowRight, FileText, Smartphone, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export function ProductDetailPage({ slug, onNavigate }: ProductDetailPageProps) {
  const { products, formatMT } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setLoading(true);
    // Find local or fetch from API
    const localProd = products.find(p => p.slug === slug || p.id === slug);
    if (localProd) {
      setProduct(localProd);
      setLoading(false);
    } else {
      fetch(`/api/products/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setProduct(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug, products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>A carregar detalhes do produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Produto não encontrado</h2>
        <p className="text-gray-500 text-sm">O produto solicitado não existe ou foi desativado.</p>
        <button
          onClick={() => onNavigate('/produtos')}
          className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-100"
        >
          Voltar à loja
        </button>
      </div>
    );
  }

  const discountPercent = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  const defaultIncludes = [
    'E-book completo em formato PDF',
    'Currículos e cartas de candidatura editáveis',
    'Modelos práticos e prontos a usar',
    'Orientações direcionadas para entrevistas',
    'Recursos e portais de oportunidade em Moçambique',
    'Acesso imediato e vitalício após confirmação do pagamento'
  ];

  const includesList = product.includes && product.includes.length > 0 ? product.includes : defaultIncludes;

  const defaultBenefits = [
    'Aumente drasticamente suas oportunidades no mercado laboral',
    'Economize tempo utilizando modelos pré-formatados em Word',
    'Aprenda como se destacar nas seleções de RH em Moçambique'
  ];

  const benefitsList = product.benefits && product.benefits.length > 0 ? product.benefits : defaultBenefits;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Top Breadcrumb */}
      <div className="text-xs text-gray-400 flex items-center gap-2">
        <button onClick={() => onNavigate('/')} className="hover:text-indigo-600">Início</button>
        <span>/</span>
        <button onClick={() => onNavigate('/produtos')} className="hover:text-indigo-600">Produtos</button>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </div>

      {/* Primary Grid: Cover + Purchase Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Cover Column */}
        <div className="lg:col-span-5 space-y-4 sticky top-28">
          <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 group">
            <img
              src={product.image_url}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {discountPercent && (
              <div className="absolute top-4 right-4 bg-rose-50 text-rose-600 border border-rose-100 font-extrabold text-sm px-3 py-1 rounded-full shadow-md">
                -{discountPercent}% DESCONTO
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-100 p-3 rounded-xl text-xs text-gray-700 flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-indigo-600" />
                {product.format || 'Digital PDF + Ficheiros Word'}
              </span>
              <span className="text-indigo-600 font-bold">Entrega Imediata</span>
            </div>
          </div>

          {/* Guarantee pill */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 text-xs text-gray-600 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block">Compra 100% Segura & Garantida</span>
              <span>Receba os seus ficheiros na tela e por e-mail logo após pagar por M-Pesa, e-Mola ou Cartão.</span>
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Card Column */}
        <div className="lg:col-span-7 space-y-8">
          
          <div>
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-3">
              Produto Digital Moçambique 🇲🇿
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-gray-200/40">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-gray-900">
                {formatMT(product.price)}
              </span>
              {product.old_price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatMT(product.old_price)}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md">
                  Poupe {formatMT(product.old_price! - product.price)}
                </span>
              )}
            </div>

            {/* Notice requested in prompt */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-amber-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Produto digital. Nenhum produto físico será enviado.</span>
            </div>

            {/* Big CTA Button */}
            <button
              onClick={() => onNavigate(`/checkout?product_id=${product.id}`)}
              className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              COMPRAR AGORA ({formatMT(product.price)})
              <ArrowRight className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600" /> Acesso Imediato
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> M-Pesa / e-Mola / Cartão
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Descrição do Produto</h3>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
              {product.description}
            </div>
          </div>

          {/* "O que você recebe?" Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-gray-200/40">
            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              O que você recebe?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {includesList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                  <span className="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Benefícios Principais</h3>
            <div className="space-y-2">
              {benefitsList.map((benefit, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-gray-100 rounded-2xl text-xs sm:text-sm text-gray-700 flex items-center gap-3 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Format info */}
          <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-xs">
            <span className="text-gray-500">Formato do Produto:</span>
            <span className="font-bold text-gray-900">{product.format || 'Ficheiros Digitais PDF / Word / ZIP'}</span>
          </div>

          {/* FAQ Accordion */}
          {product.faq && product.faq.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Perguntas Frequentes
              </h3>

              <div className="space-y-3">
                {product.faq.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-4 text-sm font-semibold text-gray-900 flex items-center justify-between gap-4 hover:text-indigo-600"
                      >
                        <span>{item.question}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs sm:text-sm text-gray-500 border-t border-gray-100 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Bottom Buy CTA */}
          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={() => onNavigate(`/checkout?product_id=${product.id}`)}
              className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              COMPRAR AGORA ({formatMT(product.price)})
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
