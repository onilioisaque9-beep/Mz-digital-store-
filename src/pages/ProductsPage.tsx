import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, BookOpen } from 'lucide-react';

interface ProductsPageProps {
  onNavigate: (path: string) => void;
}

export function ProductsPage({ onNavigate }: ProductsPageProps) {
  const { products, categories, activeCategory, setActiveCategory } = useStore();
  
  // Extract initial search query from URL if available
  const getInitialSearch = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('busca') || params.get('q') || '';
    } catch {
      return '';
    }
  };

  const [searchQuery, setSearchQuery] = useState(getInitialSearch());
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Update searchQuery if URL changes
  React.useEffect(() => {
    const query = getInitialSearch();
    if (query) {
      setSearchQuery(query);
    }
  }, [window.location.search]);

  // Filter products by search & category
  let filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.short_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          Catálogo Digital Moçambique
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Todos os Produtos Digitais
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-2xl">
          E-books, guias, manuais e conteúdos práticos para alavancar a sua carreira e negócios em Moçambique.
        </p>
      </div>

      {/* Controls Bar: Search & Sort */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-gray-200/40">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todas Categorias
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-full px-4 py-2.5 focus:outline-none focus:border-indigo-600"
          >
            <option value="featured">Mais Relevantes</option>
            <option value="price-asc">Menor Preço (MT)</option>
            <option value="price-desc">Maior Preço (MT)</option>
          </select>
        </div>

      </div>

      {/* Grid of products */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4 shadow-xl shadow-gray-200/40">
          <p className="text-gray-500 text-base">
            Nenhum produto encontrado para o termo "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700"
          >
            Limpar filtros
          </button>
        </div>
      )}

    </div>
  );
}
