import { TypeOf, any, object, string } from 'zod';

export const PostValidator = object({
  title: string()
    .min(3, {
      message: 'Title must be longer tha n 3 characters',
    })
    .max(128, { message: 'Title must be at leaast 128 characters' }),
  subredditId: string(),
  content: any(),
});
export type PostCreationRequest = TypeOf<typeof PostValidator>;
