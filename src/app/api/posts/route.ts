import { db } from '@/lib/db';
import {
  GetPostsPayload,
  GetPostsQuery,
  getPostsValidator,
} from './()/validator';
import { paginateData } from '@/lib/paginate';
import { User, Vote, VoteType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ExtendedPost } from '@/types/db';
import { getAuthSession } from '../auth/[...nextauth]/route';

export type VoteStats = {
  stat: {
    [T in Vote['type']]: number;
  };
  participants: number;
  userVoteType?: VoteType;
  voted: boolean;
};

export type PostStats = ExtendedPost & {
  votesInfo: VoteStats;
};

const GET = async (req: NextRequest) => {
  const session = await getAuthSession();
  const paginatedPosts = await getPosts(
    <GetPostsPayload>getPostsValidator.parse({
      query: Object.fromEntries(new URLSearchParams(req.url)),
    }),
    <User | undefined>session?.user ?? undefined
  );

  return NextResponse.json(paginatedPosts);
};

export const getPosts = ({ query }: { query: GetPostsQuery }, user?: User) =>
  paginateData(async ({ offset, take }) => {
    const [count, posts] = await Promise.all([
      db.post.count({
        where: {
          ...(query.subredditName &&
            !query.subredditIdNames && {
              subreddit: { name: query.subredditName },
            }),

          ...(query.subredditIdNames && {
            subreddit: { name: { in: query.subredditIdNames } },
          }),
        },
      }),
      db.post
        .findMany({
          ...((query.subredditName || query.subredditIdNames) && {
            where: {
              subreddit: {
                name: query.subredditIdNames
                  ? { in: query.subredditIdNames as Array<string> }
                  : (query.subredditName as string),
              },
            },
          }),
          skip: offset,
          take,
          include: { subreddit: true, author: true, comments: true },
          orderBy: { createdAt: 'asc' },
        })

        .then((posts) =>
          Promise.all(
            posts.map(async (post) => {
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

              const _post = <PostStats>post;
              const voteInfo = <VoteStats>{
                voted: !!userVote,
                ...(userVote && { userVoteType: userVote.type }),
              };
              voteInfo.stat = <VoteStats['stat']>(
                Object.fromEntries(
                  groupedVote.map(
                    ({ type, _count }) =>
                      [type, _count] as [type: string, count: number]
                  )
                )
              );

              voteInfo.participants =
                (voteInfo.stat.UP ?? 0) - (voteInfo.stat.DOWN ?? 0);

              _post.votesInfo = voteInfo;

              return _post;
            })
          )
        ),
    ]);

    return { data: posts, docCount: count };
  })(query);

export { GET };
