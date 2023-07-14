import authMiddleware from '@/lib/auth';
import { db } from '@/lib/db';
import { SubcribeToSubredditValidator } from '@/lib/validator/subscribeSubreddit';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const POST = authMiddleware(async ({ user }, req) => {
  try {
    const { subredditId } = SubcribeToSubredditValidator.parse(
      await req.json()
    );
    const userId = user.id as string;

    const [subReddit, alreadySubscribe] = await Promise.all([
      db.subreddit.findUnique({
        where: { id: subredditId },
      }),

      db.subscription.findFirst({
        where: { subredditId, userId },
      }),
    ]);

    if (!subReddit) {
      return new NextResponse('Subreddit Not Found', { status: 404 });
    }

    if (alreadySubscribe) {
      return new NextResponse('User already subscribed to this subreddit', {
        status: 400,
      });
    }

    await db.subscription.create({ data: { subredditId, userId } });

    return new NextResponse(subReddit.id);
  } catch (e) {
    if (e instanceof ZodError) {
      return new NextResponse(e.message, { status: 422 });
    }

    return new NextResponse('Could not subscribe. Try again later', {
      status: 500,
    });
  }
});
