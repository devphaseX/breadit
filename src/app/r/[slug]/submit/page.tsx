import React from 'react';
import { SubredditPageParams } from '../type';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { EDITOR_FORM_ID, Editor } from '@/components/Editor';

interface CreatePostPageProps {
  params: SubredditPageParams;
}

const CreatePostPage = async ({ params }: CreatePostPageProps) => {
  const subreddit = await db.subreddit.findFirst({
    where: { name: params.slug },
  });

  if (!subreddit) throw notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in r/{params.slug}
          </p>
        </div>
      </div>
      {/* form */}
      <Editor subredditId={subreddit.id} />
      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form={EDITOR_FORM_ID}>
          Post
        </Button>
      </div>
    </div>
  );
};

export default CreatePostPage;
