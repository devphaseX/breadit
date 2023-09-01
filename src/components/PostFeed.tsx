'use client';

import { FC, useEffect, useState } from 'react';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';
import axios from 'axios';
import { PaginatePayload } from '@/lib/paginate';
import { Post } from './Post';
import { PostStats } from '@/app/api/posts/route';
import { toast } from '@/hooks/use-toast';

interface PostFeedProps {
  initialPost: PaginatePayload<PostStats>;
  subredditName?: string;
}

export const PostFeed: FC<PostFeedProps> = ({ initialPost, subredditName }) => {
  const [postListRef, setPostListRef] = useState<HTMLUListElement | null>(null);
  const { ref, entry } = useIntersection({
    root: postListRef,
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
      getNextPageParam: (prevPage) => prevPage.paginate.page.next ?? undefined,
      getPreviousPageParam: (currentPage) =>
        currentPage.paginate.page.prev ?? undefined,
      initialData: {
        pages: [initialPost],
        pageParams: [initialPost.paginate.page.current],
      },
      refetchOnMount: false,
      staleTime: 60 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (!entry) return;
    if (entry?.isIntersecting && !isFetchingNextPage) {
      (async () => {
        const { isError } = await fetchNextPage();
        if (isError) {
          toast({
            title: 'Getting Post Failed',
            description: 'Something went wrong while fetching posting',
            variant: 'destructive',
          });
        }
      })();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap(({ data }) => data) ?? initialPost.data;
  return (
    <ul
      className="flex flex-col col-span-2 space-y-6"
      ref={(ref) => {
        setPostListRef(ref);
      }}
    >
      {posts.map((post, i) => {
        return (
          <li
            key={post.id}
            id={i.toString()}
            {...(i === posts.length - 1
              ? {
                  ref,
                }
              : {})}
          >
            <Post subredditName={post.subreddit.name} post={post} />
          </li>
        );
      })}
    </ul>
  );
};
