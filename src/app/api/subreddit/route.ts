import { SubRedditValidator } from '@/lib/validator/subreddit';
import { getAuthSession } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name } = SubRedditValidator.parse(req.body);

    let subreddit = await db.subreddit.findFirst({ where: { name } });

    if (subreddit) {
      return new NextResponse('Community name already taken', { status: 409 });
    }

    subreddit = await db.subreddit.create({
      data: { name, subcribers: { create: { userId: session.user.id! } } },
    });

    return new NextResponse(subreddit.name);
  } catch (e) {
    if (e instanceof ZodError) {
      return new NextResponse(e.message, { status: 422 });
    }

    return new NextResponse('Could not create your community', { status: 500 });
  }
}
