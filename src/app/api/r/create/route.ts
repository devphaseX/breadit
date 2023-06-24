import { SubRedditValidator } from '@/lib/validator/subreddit';
import { getAuthSession } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse('User not auth', { status: 400 });
    }

    const { name } = SubRedditValidator.parse(req.body);

    let subreddit = await db.subreddit.findFirst({ where: { name } });

    if (subreddit) {
      return new NextResponse('Community name already taken', { status: 422 });
    }

    subreddit = await db.subreddit.create({
      data: { name, subcribers: { create: { userId: session.user.id! } } },
    });

    return new NextResponse(subreddit.name);
  } catch (e) {
    if (e instanceof ZodError) {
      return new NextResponse(e.message, { status: 409 });
    }

    return new NextResponse(
      'Something went wrong while creating your community',
      { status: 500 }
    );
  }
}
