'use client';

import { FC, useRef } from 'react';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';
import axios from 'axios';
import { PaginatePayload } from '@/lib/paginate';
import { Post } from './Post';
import { PostStats } from '@/app/api/posts/route';

interface PostFeedProps {
  initialPost: PaginatePayload<PostStats>;
  subredditName?: string;
}

export const PostFeed: FC<PostFeedProps> = ({ initialPost, subredditName }) => {
  const lastPostRef = useRef<HTMLElement | null>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['infinite-post-query'],
    async ({ pageParam }) => {
      const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATE_RESULTS}&page=${pageParam}${
        subredditName ? '&subredditName=' + subredditName : ''
      }`;

      const { data } = await axios.get<PaginatePayload<PostStats>>(query);
      return data;
    },
    {
      getNextPageParam: (prevPage) => prevPage.paginate.page.next,
      getPreviousPageParam: (currentPage) => currentPage.paginate.page.prev,
      initialData: { pages: [initialPost], pageParams: [1] },
    }
  );

  const posts = data?.pages.flatMap(({ data }) => data) ?? initialPost.data;
  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, i) => {
        return (
          <li key={post.id} {...(i === posts.length - 1 ? { ref } : {})}>
            <Post subredditName={post.subreddit.name} post={post} />
          </li>
        );
      })}
    </ul>
  );
};
