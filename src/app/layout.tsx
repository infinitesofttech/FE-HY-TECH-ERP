import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'HY-TECH ERP | Citizen Document Services & Government Portals',
  description: 'Enterprise ERP for Aadhaar, Voter ID, PAN, Ration, Ayushman, and ABHA Card services',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-brand-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
