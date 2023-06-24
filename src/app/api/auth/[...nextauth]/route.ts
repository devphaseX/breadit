import { NextAuthOptions } from 'next-auth';
import NextAuth, { getServerSession } from 'next-auth/next';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db as prisma } from '@/lib/db';
import GoogleProvider from 'next-auth/providers/google';
import { getEnvVariable } from '@/lib/env';
import { DefaultJWT } from 'next-auth/jwt';
import { nanoid } from 'nanoid';

interface JwtToken extends DefaultJWT {
  id?: string | null;
  username?: string | null;
  image?: string | null;
}

interface JwtUserPayload extends JwtToken {}

declare module 'next-auth' {
  export interface Session {
    user: JwtUserPayload;
  }
}

declare module 'next-auth/jwt' {
  export interface JWT extends JwtToken {}
}

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: getEnvVariable('GOOGLE_CLIENT_ID'),
      clientSecret: getEnvVariable('GOOGLE_CLIENT_SECRET'),
    }),
  ],

  pages: { signIn: '/sign-in' },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.username = token.username;
      }
      return session;
    },

    async jwt({ token, user }) {
      const dbUser =
        token.email != null &&
        (await prisma.user.findUnique({ where: { email: token.email } }));

      if (!dbUser) {
        token.id = user.id;
        return token;
      }

      if (!dbUser.username) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            username: nanoid(10),
          },
        });
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.name,
        name: dbUser.name,
        image: dbUser.image,
      };
    },

    redirect() {
      return '/';
    },
  },
};

const handler = NextAuth(authOptions);

const getAuthSession = () => getServerSession(authOptions);

export { handler as GET, handler as POST, getAuthSession };
