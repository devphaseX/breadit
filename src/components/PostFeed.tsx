'use client';

import { ExtendedPost } from '@/types/db';
import { FC, useRef, useState } from 'react';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { INFINITE_SCROLLING_PAGINATE_RESULTS } from '@/config';
import axios from 'axios';
import { PaginatePayload } from '@/lib/paginate';
import { useSession } from 'next-auth/react';
import { Post } from './Post';

interface PostFeedProps {
  initialPost: PaginatePayload<ExtendedPost>;
  subredditName?: string;
}

export const PostFeed: FC<PostFeedProps> = ({ initialPost, subredditName }) => {
  const lastPostRef = useRef<HTMLElement | null>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['infinite-post-query'],
    async ({ pageParam }) => {
      const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATE_RESULTS}&page=${pageParam}${
        subredditName ? '&subredditName=$' + subredditName : ''
      }`;

      const { data } = await axios.get<PaginatePayload<ExtendedPost>>(query);
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
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === 'UP') return acc + 1;
          if (vote.type === 'DOWN') return acc - 1;
          return acc;
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        return (
          <li key={post.id} {...(i === posts.length - 1 ? { ref } : {})}>
            <Post subredditName={post.subreddit.name} post={post} />
          </li>
        );
      })}
    </ul>
  );
};
