import { object, string } from 'zod';

const SubcribeToSubredditValidator = object({
  subredditId: string(),
});

export { SubcribeToSubredditValidator };
