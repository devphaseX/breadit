import authMiddleware from '@/lib/auth';
import { db } from '@/lib/db';
import { UnsubcribeSubredditValidator } from '@/lib/validator/unsubscribeSubreddit';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const DELETE = authMiddleware<{ params: { subredditId: string } }>(
  async ({ user }, __, { params }) => {
    try {
      const {
        params: { subredditId },
      } = UnsubcribeSubredditValidator.parse({
        params,
      });

      const userId = user.id as string;
      const [subscription, subredddit] = await Promise.all([
        db.subscription.findFirst({
          where: { subredditId },
        }),
        db.subreddit.findUnique({ where: { id: subredditId } }),
      ]);

      if (!subredddit) {
        return new NextResponse('Subreddit not found', { status: 404 });
      }

      if (!subscription) {
        return new NextResponse('User not a member of this subreddit', {
          status: 400,
        });
      }

      await db.subscription.delete({
        where: { userId_subredditId: { subredditId, userId } },
      });

      return new NextResponse(
        `Successfully unsubscribe from this subreddit ${subredddit.name}`
      );
    } catch (e) {
      if (e instanceof ZodError) {
        return new NextResponse(e.message, { status: 422 });
      }

      return new NextResponse('Could not unsubscribe from this subreddit', {
        status: 500,
      });
    }
  }
);
