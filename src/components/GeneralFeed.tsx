import { getPosts } from '@/app/api/posts/route';
import { PostFeed } from './PostFeed';
import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';

const GeneralFeed = async () => {
  const paginatedPosts = await getPosts({
    query: { limit: INFINITE_SCROLLING_PAGINATE_RESULTS, page: 1 },
  });

  return <PostFeed initialPost={paginatedPosts} />;
};

export { GeneralFeed };
