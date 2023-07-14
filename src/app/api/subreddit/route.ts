import { SubRedditValidator } from '@/lib/validator/subreddit';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ZodError } from 'zod';
import authMiddleware from '@/lib/auth';

export const POST = authMiddleware(async (session, req) => {
  try {
    const { name } = SubRedditValidator.parse(await req.json());

    let subreddit = await db.subreddit.findFirst({ where: { name } });

    if (subreddit) {
      return new NextResponse('Community name already taken', { status: 409 });
    }

    subreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session.user.id,
        subcribers: { create: { userId: session.user.id! } },
      },
    });

    return new NextResponse(subreddit.name);
  } catch (e) {
    if (e instanceof ZodError) {
      return new NextResponse(e.message, { status: 422 });
    }

    return new NextResponse('Could not create your community', { status: 500 });
  }
});
