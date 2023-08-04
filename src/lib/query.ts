import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';
import { TypeOf, number, object } from 'zod';

const paginationSchema = object({
  limit: number({ coerce: true })
    .int()
    .positive()
    .default(INFINITE_SCROLLING_PAGINATE_RESULTS),
  page: number({ coerce: true }).int().positive().default(1),
});

type PaginateQuery = TypeOf<typeof paginationSchema>;

export { type PaginateQuery, paginationSchema };
