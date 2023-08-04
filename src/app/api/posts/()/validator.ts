import { paginationSchema } from '@/lib/query';
import { TypeOf, object, string } from 'zod';

export const getPostsValidator = object({
  query: paginationSchema.extend({ subredditName: string().optional() }),
});

type GetPostsPayload = TypeOf<typeof getPostsValidator>;
type GetPostsQuery = GetPostsPayload['query'];
export type { GetPostsPayload, GetPostsQuery };
