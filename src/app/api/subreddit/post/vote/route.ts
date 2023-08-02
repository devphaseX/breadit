import authMiddleware from '@/lib/auth';
import { db } from '@/lib/db';
import { postVoteValidator } from '@/lib/validator/voteValidator';
import { NextResponse } from 'next/server';

const PATCH = authMiddleware(async ({ user }, req) => {
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

  if (!vote) {
    await db.vote.create({
      data: {
        type: payload.voteType,
        postId: payload.postId,
        userId: <string>user.id,
      },
    });
  } else if (vote.type !== payload.voteType) {
    await db.vote.update({
      where: {
        userId_postId: { postId: payload.postId, userId: <string>user.id },
      },
      data: { type: payload.voteType },
    });
  } else {
    return NextResponse.json(
      `The user's vote type is already set to ${payload.voteType}.`,
      { status: 409 }
    );
  }

  return NextResponse.json("The user's vote type was updated successfully.");
});

export { PATCH };
