import { TypeOf, object, string } from 'zod';

const SubRedditValidator = object({ name: string().min(3).max(21) });
const SubRedditSubscriptionValidator = object({ subredditId: string() });
type SubRedditPayload = TypeOf<typeof SubRedditValidator>;
type SubRedditSubscriptionPayload = TypeOf<
  typeof SubRedditSubscriptionValidator
>;
export {
  SubRedditValidator,
  type SubRedditPayload,
  type SubRedditSubscriptionPayload,
};
