import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface PostIncludes
  extends Pick<
    Prisma.PostInclude,
    'votes' | 'comments' | 'author' | 'subreddit'
  > {
  votes: true;
  subreddit: true;
  author: true;
  comments: true;
}

type DbQueriedPostPayload = NonNullable<
  Awaited<ReturnType<typeof db.post.findFirst<{ include: PostIncludes }>>>
>;

interface ExtendedPost extends DbQueriedPostPayload {}

export type { ExtendedPost };
