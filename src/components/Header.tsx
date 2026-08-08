import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, User, Menu, X, ShieldCheck, HelpCircle, ArrowRight, LayoutDashboard, Search, BookOpen, Tag } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const { user, logout, products, categories, formatMT, setActiveCategory } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real-time Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products and categories in real-time
  const trimmedQuery = searchQuery.trim().toLowerCase();
  
  const matchingProducts = trimmedQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.short_description.toLowerCase().includes(trimmedQuery) ||
        (p.category_id && p.category_id.toLowerCase().includes(trimmedQuery))
      ).slice(0, 5)
    : [];

  const matchingCategories = trimmedQuery
    ? categories.filter(c =>
        c.name.toLowerCase().includes(trimmedQuery) ||
        c.description.toLowerCase().includes(trimmedQuery)
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      onNavigate(`/produtos?busca=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Produtos', path: '/produtos' },
    { label: 'Categorias', path: '/produtos#categorias' },
    { label: 'Meus produtos', path: '/minha-conta' },
    { label: 'Suporte', path: '/suporte' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 text-gray-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => onNavigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-100">
              MZ
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                MZ Digital Store
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-mono font-semibold">
                  🇲🇿 MT
                </span>
              </span>
              <p className="text-[10px] text-gray-400 tracking-wider font-medium uppercase">
                Produtos Digitais Moçambique
              </p>
            </div>
          </div>

          {/* Real-time Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="relative hidden md:block w-56 lg:w-72 xl:w-80 mx-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar e-book ou categoria em tempo real..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-full bg-gray-100/80 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Real-time Dropdown Suggestions Popover */}
            {isSearchOpen && trimmedQuery.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-3 space-y-3 animate-in fade-in duration-150">
                
                {/* Category matches */}
                {matchingCategories.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 block">
                      Categorias Encontradas
                    </span>
                    {matchingCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          onNavigate('/produtos');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-gray-800 flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-indigo-600" />
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">Filtrar</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Product matches */}
                {matchingProducts.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 block">
                      E-books Digitais ({matchingProducts.length})
                    </span>
                    {matchingProducts.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          onNavigate(`/produto/${prod.slug}`);
                        }}
                        className="p-2 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition group"
                      >
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover rounded-lg border border-gray-100 shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition">
                            {prod.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 truncate">{prod.short_description}</p>
                          <span className="text-xs font-extrabold text-indigo-600">{formatMT(prod.price)}</span>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition text-center mt-2"
                    >
                      Ver todos os resultados para "{searchQuery}"
                    </button>
                  </div>
                ) : matchingCategories.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">
                    Nenhum e-book ou categoria encontrado para "{searchQuery}".
                  </div>
                ) : null}

              </div>
            )}
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('/admin')}
                className="ml-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-100 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Painel Admin
              </button>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/minha-conta')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-800 border border-gray-200 transition"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 transition"
              >
                Entrar
              </button>
            )}

            {/* Featured Highlighted CTA */}
            <button
              onClick={() => onNavigate('/produto/preparado-para-o-emprego-mz')}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-100 transition-all flex items-center gap-1.5 transform active:scale-95"
            >
              Comprar agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => onNavigate('/produto/preparado-para-o-emprego-mz')}
              className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-100"
            >
              Comprar
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-3 pb-6 space-y-3">
          
          {/* Mobile Real-time Search */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              setMobileMenuOpen(false);
              onNavigate(`/produtos?busca=${encodeURIComponent(searchQuery.trim())}`);
            }
          }} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar e-books ou categorias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition"
            />
          </form>

          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                onNavigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${
                currentPath === item.path
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          {user?.role === 'admin' && (
            <button
              onClick={() => {
                onNavigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-amber-700 bg-amber-50 border border-amber-200"
            >
              👑 Painel Administrativo
            </button>
          )}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-medium text-gray-800">Olá, {user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-center hover:bg-gray-50"
              >
                Entrar na Conta
              </button>
            )}

            <button
              onClick={() => {
                onNavigate('/produto/preparado-para-o-emprego-mz');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-full bg-indigo-600 text-white font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              Comprar agora (249 MT)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
