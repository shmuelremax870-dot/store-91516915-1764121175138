import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import AdminLayout from '../components/layout/AdminLayout';
import '../styles/globals.css';

// Pages that should NOT be wrapped with AdminLayout
const noLayoutPages = ['/login', '/register', '/forgot-password'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const skipLayout = noLayoutPages.includes(router.pathname);

  if (skipLayout) {
    return <Component {...pageProps} />;
  }

  return (
    <AdminLayout>
      <Component {...pageProps} />
    </AdminLayout>
  );
}
