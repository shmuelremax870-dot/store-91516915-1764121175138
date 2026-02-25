import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/stores': 'Stores',
  '/stores/create': 'Create Store',
  '/products': 'Products',
  '/orders': 'Orders',
  '/account-holders': 'Account Holders',
  '/account-holders/create': 'Add Account Holder',
  '/torah-fund': 'Torah Fund',
  '/payouts': 'Payouts',
  '/etsy-api': 'Etsy API',
  '/printful': 'Printful',
  '/seo': 'SEO Engine',
  '/api-secrets': 'API Secrets',
  '/audit-log': 'Audit Log',
  '/settings': 'Settings',
  '/agents': 'Agents',
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Determine page title from the current route
  const pageTitle =
    pageTitles[router.pathname] ||
    router.pathname
      .split('/')
      .pop()
      ?.replace(/-/g, ' ')
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - z-30 */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Header - z-20 */}
      <Header title={pageTitle} onMenuClick={toggleSidebar} />

      {/* Main content area - z-10, scrollable */}
      <main className="lg:ml-64 pt-16 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
