import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, ArrowRight, Star, FileText, Check } from 'lucide-react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onNavigate: (path: string) => void;
  featured?: boolean;
}

export function ProductCard({ product, onNavigate, featured = false }: ProductCardProps) {
  const { formatMT } = useStore();

  const discountPercent = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  return (
    <div
      onClick={() => onNavigate(`/produto/${product.slug}`)}
      className={`group relative bg-white border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
        featured
          ? 'border-indigo-200 shadow-xl shadow-indigo-100/60 ring-2 ring-indigo-500/20'
          : 'border-gray-100 hover:border-indigo-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-indigo-100/50'
      }`}
    >
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-3 right-3 z-10 bg-rose-50 text-rose-600 border border-rose-100 font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
          -{discountPercent}% OFF
        </div>
      )}

      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 left-3 z-10 bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
          Mais Vendido 🇲🇿
        </div>
      )}

      <div>
        {/* Cover Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-700 font-medium bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-100 shadow-xs">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              {product.format || 'Digital PDF'}
            </span>
            <span className="text-indigo-600 font-semibold">Acesso Imediato</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          <p className="text-gray-500 text-xs sm:text-sm line-clamp-3 leading-relaxed">
            {product.short_description}
          </p>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="p-5 pt-0 mt-auto border-t border-gray-100 flex items-center justify-between gap-3 pt-4">
        <div>
          <div className="text-[11px] text-gray-400 font-medium">Preço com Acesso Vitalício</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
              {formatMT(product.price)}
            </span>
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatMT(product.old_price)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(`/produto/${product.slug}`);
          }}
          className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-100 group-hover:shadow-indigo-200 transition-all"
        >
          Comprar agora
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
