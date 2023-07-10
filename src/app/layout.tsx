import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/Toaster';
import { AuthSessionProvider } from '@/components/AuthSessionProvider';
import { Providers } from '@/components/Providers';
import localFont from 'next/font/local';
import { getAuthSession } from './api/auth/[...nextauth]/route';

export const metadata = {
  title: 'Breadit',
  description: 'A Reddit clone built with Next.js and TypeScript.',
};

const Inter = localFont({
  src: '../../public/font/inter/inter-variable.ttf',
  variable: '--inter-variable',
});

export default async function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  const session = await getAuthSession();

  return (
    <html
      lang="en"
      className={cn('bg-white text-slate-900 antialiased', Inter.className)}
    >
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <AuthSessionProvider session={session}>
          <Providers>
            {/* @ts-expect-error server side component */}
            <Navbar />
            {authModal}
            <div className="container max-w-7xl h-full pt-12">{children}</div>
          </Providers>
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
