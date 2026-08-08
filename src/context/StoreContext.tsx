import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, User } from '../types';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  loadingProducts: boolean;
  user: User | null;
  formatMT: (price: number) => string;
  login: (email: string, name?: string, phone?: string, role?: 'admin' | 'customer', age?: number, gender?: string) => void;
  updateProfile: (data: Partial<User>) => void;
  logout: () => void;
  refreshProducts: () => Promise<void>;
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mz_digital_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const fetchProductsAndCategories = async () => {
    try {
      setLoadingProducts(true);
      const [resProd, resCat] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      if (resProd.ok) {
        const dataProd = await resProd.json();
        setProducts(dataProd);
      }
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategories(dataCat);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do servidor:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const formatMT = (price: number): string => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + ' MT';
  };

  const login = (
    email: string,
    name?: string,
    phone?: string,
    role: 'admin' | 'customer' = 'customer',
    age?: number,
    gender?: string
  ) => {
    const newUser: User = {
      id: role === 'admin' ? 'user-admin' : 'usr-' + Date.now(),
      name: name || (role === 'admin' ? 'Administrador' : email.split('@')[0]),
      email,
      phone: phone || '+258 84 123 4567',
      role,
      age: age || undefined,
      gender: gender || undefined,
      created_at: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('mz_digital_user', JSON.stringify(newUser));
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('mz_digital_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mz_digital_user');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        loadingProducts,
        user,
        formatMT,
        login,
        updateProfile,
        logout,
        refreshProducts: fetchProductsAndCategories,
        activeCategory,
        setActiveCategory
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
