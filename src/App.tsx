import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentWaitingPage } from './pages/PaymentWaitingPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailedPage } from './pages/PaymentFailedPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyAccountPage } from './pages/MyAccountPage';
import { SupportPage } from './pages/SupportPage';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract query params if present
  const getQueryParam = (param: string) => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return params.get(param);
  };

  const renderContent = () => {
    const path = currentPath;

    if (path === '/' || path === '') {
      return <HomePage onNavigate={navigate} />;
    }

    if (path === '/produtos') {
      return <ProductsPage onNavigate={navigate} />;
    }

    if (path.startsWith('/produto/')) {
      const slug = path.replace('/produto/', '');
      return <ProductDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (path === '/checkout') {
      const productId = getQueryParam('product_id') || undefined;
      return <CheckoutPage productId={productId} onNavigate={navigate} />;
    }

    if (path.startsWith('/pagamento/aguardando')) {
      const orderId = getQueryParam('order_id') || 'ORD-MZ-101';
      return <PaymentWaitingPage orderId={orderId} onNavigate={navigate} />;
    }

    if (path.startsWith('/pagamento/sucesso')) {
      const orderId = getQueryParam('order_id') || 'ORD-MZ-101';
      return <PaymentSuccessPage orderId={orderId} onNavigate={navigate} />;
    }

    if (path.startsWith('/pagamento/falhou')) {
      const orderId = getQueryParam('order_id') || undefined;
      return <PaymentFailedPage orderId={orderId} onNavigate={navigate} />;
    }

    if (path === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }

    if (path === '/registo') {
      return <RegisterPage onNavigate={navigate} />;
    }

    if (path.startsWith('/minha-conta')) {
      return <MyAccountPage onNavigate={navigate} />;
    }

    if (path === '/suporte') {
      return <SupportPage onNavigate={navigate} />;
    }

    if (path.startsWith('/admin')) {
      let subSection = 'overview';
      if (path.includes('/produtos')) subSection = 'products';
      if (path.includes('/pedidos')) subSection = 'orders';
      if (path.includes('/clientes')) subSection = 'customers';
      if (path.includes('/categorias')) subSection = 'categories';
      if (path.includes('/cupons')) subSection = 'coupons';
      if (path.includes('/configuracoes')) subSection = 'settings';

      return <AdminDashboard onNavigate={navigate} subSection={subSection} />;
    }

    // Default fallback
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <StoreProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
        <Header currentPath={currentPath} onNavigate={navigate} />
        
        <main className="flex-1">
          {renderContent()}
        </main>

        <Footer onNavigate={navigate} />
      </div>
    </StoreProvider>
  );
}
