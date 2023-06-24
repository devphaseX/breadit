import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/Toaster';
import { AuthSessionProvider } from '@/components/AuthSessionProvider';

export const metadata = {
  title: 'Breadit',
  description: 'A Reddit clone built with Next.js and TypeScript.',
};

const fontClassName = '';

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn('bg-white text-slate-900 antialiased', fontClassName)}
    >
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <AuthSessionProvider>
          {/* @ts-expect-error server side component */}
          <Navbar />
          {authModal}
          <div className="container max-w-7xl h-full pt-12">{children}</div>
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
