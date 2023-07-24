import authMiddleware from '@/lib/auth';
import { db } from '@/lib/db';
import { PostValidator } from '@/lib/validator/formValidator';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const POST = authMiddleware(async ({ user }, req) => {
  try {
    const { title, subredditId, content } = PostValidator.parse(
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

    if (!alreadySubscribe) {
      return new NextResponse('Subscribe to post', {
        status: 400,
      });
    }

    await db.post.create({
      data: { title, subredditId, content, authorId: userId },
    });

    return new NextResponse('Post created');
  } catch (e) {
    if (e instanceof ZodError) {
      return new NextResponse('Invalid POST request data passed', {
        status: 422,
      });
    }

    return new NextResponse(
      'Could not post to this subreddit at the moment, please try again later.',
      {
        status: 500,
      }
    );
  }
});
