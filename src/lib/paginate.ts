import { PaginateQuery } from './query';

interface DataQueryContext extends PaginateQuery {}
type ParsedQuery = { take: number; offset: number };
type DataQueryFnPayload<T> = { docCount: number; data: Array<T> };
type DataQueryFn<T> = (context: ParsedQuery) => Promise<DataQueryFnPayload<T>>;

type PaginatePayload<T> = {
  data: Array<T>;
  paginate: {
    page: { next: number | null; current: number; prev: number | null };
    count: number;
  };
};

function paginateData<T>(fn: DataQueryFn<T>) {
  return async function (
    context: Partial<DataQueryContext>,
    defaultPayload?: Partial<DataQueryContext>
  ): Promise<PaginatePayload<T>> {
    const finalizedContext = {
      ...defaultPayload,
      ...context,
    } as DataQueryContext;

    if (!('limit' in finalizedContext)) {
      throw new TypeError('Expect `limit` to be present on the context');
    }

    if (!('page' in finalizedContext)) {
      throw new TypeError('Expect `page` to be present on the context');
    }
    const { limit, page } = finalizedContext;

    const { data, docCount } = await fn({
      take: limit,
      offset: Math.max(0, (page - 1) * limit),
    } satisfies ParsedQuery);

    const { page: currentPage, limit: docLimit } = finalizedContext;
    const pageCount = docCount === 0 ? 0 : Math.ceil(docCount / docLimit);
    const nextPage = currentPage + 1 > pageCount ? null : currentPage + 1;
    const prevPage = currentPage === 1 ? null : currentPage - 1;

    return {
      data,
      paginate: {
        page: {
          current: currentPage,
          next: nextPage,
          prev: prevPage,
        },
        count: pageCount,
      },
    };
  };
}
export { paginateData };
export type { PaginatePayload, DataQueryContext };
