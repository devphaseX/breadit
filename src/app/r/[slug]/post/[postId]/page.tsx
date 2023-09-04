import { FC, Suspense } from 'react';
import { PageProps } from '../../../../../../.next/types/app/layout';
import { redis } from '@/lib/redis';
import { CachedPost } from '@/types/redis';
import { PostStats, VoteStats } from '@/app/api/posts/route';
import { db } from '@/lib/db';
import { Session } from 'next-auth';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';
import { buttonVariants } from '@/components/ui/Button';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { PostVoteServer } from '@/components/postVote/postVoteServer';
import { formatTimeToNow } from '@/lib/utils';
import { EditorOutput } from '@/components/EditorOutput';

interface PostPageProps extends PageProps {
  params: { postId: string };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const getPost = (postId: string, user?: Session['user'] | null) =>
  db.post
    .findFirst({
      where: { id: postId },
      include: { subreddit: true, author: true, comments: true },
      orderBy: { createdAt: 'asc' },
    })
    .then(async (post) => {
      if (!post) return null;

      const [userVote, groupedVote] = await Promise.all([
        user
          ? db.vote.findFirst({
              where: { postId: post.id, userId: user.id! },
            })
          : null,
        db.vote.groupBy({
          where: { postId: post.id },
          by: ['type'],
          _count: true,
        }),
      ]);

      const _post = post as PostStats;

      const voteInfo = {
        voted: !!userVote,
        ...(userVote && { userVoteType: userVote.type }),
      } as VoteStats;

      voteInfo.stat = Object.fromEntries(
        groupedVote.map(
          ({ type, _count }) => [type, _count] as [type: string, count: number]
        )
      ) as VoteStats['stat'];

      voteInfo.participants =
        (voteInfo.stat.UP ?? 0) - (voteInfo.stat.DOWN ?? 0);

      _post.votesInfo = voteInfo;

      return _post;
    });

const PostPage = async ({ params: { postId } }: PostPageProps) => {
  let cachedPost = (await redis.hgetall(`post:${postId}`)) as CachedPost | null;

  let post: PostStats | null = null;

  if (!cachedPost) {
    const session = await getAuthSession();
    const post = await getPost(postId, session?.user ?? null);

    if (!post) return notFound();
    cachedPost = {
      id: post.id,
      content: post.content as string,
      authorUsername: post.author.username as string,
      title: post.title,
      createdAt: post.createdAt,
      currentVote: null,
    };
  }

  console.log(cachedPost);
  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-ignore */}
          <PostVoteServer
            postId={cachedPost?.id}
            getPostData={() => getPost(postId)}
          />
        </Suspense>
        <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            Posted by u/{cachedPost.authorUsername}{' '}
            {formatTimeToNow(new Date(cachedPost.createdAt))}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
            {cachedPost.title}
          </h1>

          <EditorOutput content={cachedPost.content} />
        </div>
      </div>
    </div>
  );
};

function PostVoteShell() {
  return (
    <div className="flex items-center flex-col pr-6 w-20">
      {/* upvote */}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>
      {/* score */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      {/* downvote */}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
}

export default PostPage;
