import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { MiniCreatePost } from '@/components/MinCreatePost';
import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { SubredditPageParams } from './type';
import { PostFeed } from '@/components/PostFeed';
import { paginateData } from '@/lib/paginate';

interface PageProps {
  params: SubredditPageParams;
}

const Page = async ({ params: { slug } }: PageProps) => {
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

  const paginatedPostPayload = await paginateData(async ({ limit, page }) => {
    const [postCounts, posts] = await Promise.all([
      db.post.count(),
      db.post.findMany({
        include: { votes: true, author: true, subreddit: true, comments: true },
        take: limit,
        skip: page * limit,
      }),
    ]);

    return { data: posts, docCount: postCounts };
  })({ limit: INFINITE_SCROLLING_PAGINATE_RESULTS, page: 0 });

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        r/{subreddit.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed
        initialPost={paginatedPostPayload}
        subredditName={subreddit.name}
      />
    </>
  );
};

export default Page;
