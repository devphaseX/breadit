import { VoteType } from '@prisma/client';
import { TypeOf, nativeEnum, object, string } from 'zod';

export const postVoteValidator = object({
  postId: string().uuid(),
  voteType: nativeEnum(VoteType),
});

export type PostVoteRequest = TypeOf<typeof postVoteValidator>;

export const commentVoteValidator = object({
  commentId: string().uuid(),
  voteType: nativeEnum(VoteType),
});

export type CommentVoteRequest = TypeOf<typeof commentVoteValidator>;
