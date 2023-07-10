'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { FC, ReactNode } from 'react';

interface AuthSessionProviderProps {
  children: ReactNode;
  session: Session | null;
}

const AuthSessionProvider: FC<AuthSessionProviderProps> = ({
  children,
  session,
}) => <SessionProvider session={session}>{children}</SessionProvider>;

export { AuthSessionProvider };
