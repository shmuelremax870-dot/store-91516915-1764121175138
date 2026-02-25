import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  Heart,
  Wallet,
  Globe,
  Printer,
  Search,
  Key,
  FileText,
  Settings,
  X,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'Stores', href: '/stores', icon: <Store size={20} /> },
      { label: 'Products', href: '/products', icon: <Package size={20} /> },
      { label: 'Orders', href: '/orders', icon: <ShoppingCart size={20} /> },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      { label: 'Account Holders', href: '/account-holders', icon: <Users size={20} /> },
      { label: 'Torah Fund', href: '/torah-fund', icon: <Heart size={20} /> },
      { label: 'Payouts', href: '/payouts', icon: <Wallet size={20} /> },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { label: 'Etsy API', href: '/etsy-api', icon: <Globe size={20} /> },
      { label: 'Printful', href: '/printful', icon: <Printer size={20} /> },
      { label: 'SEO Engine', href: '/seo', icon: <Search size={20} /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'API Secrets', href: '/api-secrets', icon: <Key size={20} /> },
      { label: 'Audit Log', href: '/audit-log', icon: <FileText size={20} /> },
      { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') return router.pathname === '/dashboard' || router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0f172a] z-30
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 bg-brand-600 rounded-lg group-hover:bg-brand-500 transition-colors">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Etsy Auto
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                          transition-colors duration-150
                          ${
                            active
                              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <span className={active ? 'text-white' : 'text-slate-500'}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-brand-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">EA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Etsy Auto</p>
              <p className="text-xs text-slate-500 truncate">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
