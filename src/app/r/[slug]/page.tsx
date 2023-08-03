import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { MiniCreatePost } from '@/components/MinCreatePost';
import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { SubredditPageParams } from './type';
import { PostFeed } from '@/components/PostFeed';
import { getPosts } from '@/app/api/posts/route';
import { NextPageContext } from 'next';
import { getPostsValidator } from '@/app/api/posts/()/validator';
import { User } from '@prisma/client';

interface PageProps extends NextPageContext {
  params: SubredditPageParams;
}

const Page = async (props: PageProps) => {
  const {
    params: { slug },
    query: rawQuery,
  } = props;

  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      post: {
        include: { author: true, votes: true, comments: true, subreddit: true },
      },
    },
    take: INFINITE_SCROLLING_PAGINATE_RESULTS,
  });

  if (!subreddit) {
    return notFound();
  }

  const paginatedPosts = await getPosts(
    getPostsValidator.parse({
      query: { ...rawQuery, subredditName: subreddit.name },
    }),
    (session?.user ?? undefined) as User
  );

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        r/{subreddit.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPost={paginatedPosts} subredditName={subreddit.name} />
    </>
  );
};

export default Page;
