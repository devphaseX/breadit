import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { NextResponse } from 'next/server';

type AuthHandler<Context> = (
  session: Session,
  req: Request,
  context: Context
) => unknown | Promise<unknown>;

type AuthMiddlwareHandler<Context> = (
  req: Request,
  res: Context
) => unknown | Promise<unknown>;

export default function authMiddleware<Context>(
  handler: AuthHandler<Context>
): AuthMiddlwareHandler<Context> {
  return async (req, context) => {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return handler(session, req, context);
  };
}
