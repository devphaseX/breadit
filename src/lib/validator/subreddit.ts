import { object, string } from 'zod';

const SubRedditValidator = object({ name: string().min(3).max(21) });

export { SubRedditValidator };
