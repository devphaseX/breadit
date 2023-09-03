import { PostStats, VoteStats } from '@/app/api/posts/route';
import authMiddleware from '@/lib/auth';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { postVoteValidator } from '@/lib/validator/voteValidator';
import { CachedPost } from '@/types/redis';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

const CACHE_AFTER_VOTES = 1;

const PATCH = authMiddleware(async ({ user }, req) => {
  try {
    const payload = postVoteValidator.parse(await req.json());

    const [post, vote] = await Promise.all([
      db.post.findFirst({ where: { id: payload.postId } }),

      db.vote.findFirst({
        where: { postId: payload.postId, userId: <string>user.id },
      }),
    ]);

    if (!post) {
      return NextResponse.json('Post not found', { status: 404 });
    }

    if (vote) {
      if (vote.type === payload.voteType) {
        await db.vote.delete({
          where: {
            userId_postId: { postId: payload.postId, userId: <string>user.id },
          },
        });

        return new NextResponse('OK');
      }

      await db.vote.update({
        where: {
          userId_postId: { postId: payload.postId, userId: <string>user.id },
        },

        data: { type: payload.voteType },
      });

      return new Response('OK');
    }

    await db.vote.create({
      data: {
        type: payload.voteType,
        postId: post.id,
        userId: <string>user.id,
      },
    });

    const postInfo = await db.post
      .findFirst({
        where: { id: payload.postId, authorId: <string>user.id },
        include: { subreddit: true, author: true, comments: true },
      })
      .then(async (post) => {
        if (!post) throw new Error('Post not found');

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
        voteInfo.participants = Object.values(voteInfo.stat).reduce(
          (acc, cur) => acc + cur,
          0
        );

        _post.votesInfo = voteInfo;

        return _post;
      });

    if (postInfo.votesInfo.participants >= CACHE_AFTER_VOTES) {
      const cachedPost: CachedPost = {
        id: post.id,
        title: post.title,
        authorUsername: <string>user.name,
        content: JSON.stringify(post.content),
        currentVote: payload.voteType,
        createdAt: post.createdAt,
      };

      await redis.hset(`post:${post.id}`, cachedPost);
    }
    return new Response('OK');
  } catch (e) {
    if (Object(e) === e) {
      if (e instanceof ZodError) {
        return NextResponse.json(e.message, { status: 422 });
      }

      if (e instanceof Error && e.message.match(/post/i)) {
        return NextResponse.json(e.message, { status: 400 });
      }
    }

    return NextResponse.json('Something went wrong while updating vote', {
      status: 500,
    });
  }
});

export { PATCH };
