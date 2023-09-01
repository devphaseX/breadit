import { PostStats } from '@/app/api/posts/route';
import { formatTimeToNow } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { FC, useRef } from 'react';
import { EditorOutput } from './EditorOutput';
import { PostVoteClient } from './postVote/postVoteClient';

interface PostProps {
  subredditName?: string;
  post: PostStats;
}

export const Post: FC<PostProps> = ({ subredditName, post }) => {
  const postContentDivRef = useRef<HTMLDivElement>(null);
  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        {/* PostVotes */}
        <PostVoteClient
          initialVoteParticipants={post.votesInfo.participants}
          initialUserVoteType={post.votesInfo.userVoteType ?? null}
          postId={post.id}
        />
        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {subredditName && (
              <>
                <a
                  href={`/r/${subredditName}`}
                  className="underline text-zinc-900 text-sm underline-offset-2"
                >
                  r/{subredditName}
                </a>
                <span className="px-1">*</span>
              </>
            )}
            <span className="">Posted by u/{post.author.name}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>
          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={postContentDivRef}
          >
            <EditorOutput content={post.content} />
            {postContentDivRef.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <Link
          className="w-fit flex items-center gap-2"
          href={`/r/${subredditName}/post/${post.id}`}
        >
          <MessageSquare className="h-4 w-4" />
          {post.comments.length} comments
        </Link>
      </div>
    </div>
  );
};
