import { subredditIdName } from '@/app/api/subreddit/constant';
import { object, string } from 'zod';

const UnsubcribeSubredditValidator = object({
  params: object({ [subredditIdName]: string() }),
});

export { UnsubcribeSubredditValidator };
