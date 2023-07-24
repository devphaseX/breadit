import { ExtendedPost } from '@/types/db';
import { FC } from 'react';

interface PostProps {
  subredditName?: string;
  post: ExtendedPost;
}

export const Post: FC<PostProps> = ({ subredditName, post }) => {
  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        {/* PostVotes */}
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
            <span className="">Posted by u/{post.author.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
