import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

type AuthHandler<Context> = (
  session: Session,
  req: NextRequest,
  context: Context
) => unknown | Promise<unknown>;

type AuthMiddlwareHandler<Context> = (
  req: NextRequest,
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
