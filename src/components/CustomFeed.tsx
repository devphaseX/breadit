import { getPosts } from '@/app/api/posts/route';
import { User } from '@prisma/client';
import { Session } from 'next-auth';
import React from 'react';
import { PostFeed } from './PostFeed';
import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';
import { db } from '@/lib/db';

interface CustomFeedProps {
  user: Session['user'];
}

const CustomFeed = async ({ user }: CustomFeedProps) => {
  const subreddits = await db.subreddit.findMany({
    select: { name: true },
    where: { subcribers: { some: { userId: user.id as string } } },
  });

  const posts = await getPosts(
    {
      query: {
        limit: INFINITE_SCROLLING_PAGINATE_RESULTS,
        page: 1,
        subredditIdNames: subreddits.map(({ name }) => name),
      },
    },
    user as User
  );
  return <PostFeed initialPost={posts} />;
};

export { CustomFeed };
