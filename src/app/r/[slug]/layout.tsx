import { FC } from 'react';
import { SubredditPageParams } from './type';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { SubcribeLeaveToggle } from '@/components/SubcribeLeaveToggle';

interface LayoutProps {
  children: React.ReactNode;
  params: SubredditPageParams;
}

const Layout = async ({ children, params: { slug } }: LayoutProps) => {
  const session = await getAuthSession();
  const [subreddit, subRedditMembersCount, subscription] = await Promise.all([
    db.subreddit.findFirst({
      where: { name: slug },
      include: { post: { include: { author: true, votes: true } } },
    }),
    db.subreddit.count({ where: { name: slug } }),
    session?.user &&
      db.subscription.findFirst({
        where: { subreddit: { name: slug }, userId: session.user.id! },
      }),
  ]);

  const userSubscribedSubreddit = !!subscription;

  if (!subreddit) return notFound();
  console.log(subreddit.creatorId, session?.user.id);

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-12">
      <div>
        {/* TODO button to take us back */}
        <div className="grid grid-col-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>
          {/* Info sidebar */}
          <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
            <div className="px-6 Py-4">
              <p className="font-semibold py-3">About r/{slug}</p>
            </div>
            <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, 'MMMM d, yyyy')}
                  </time>
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Member</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{subRedditMembersCount}</div>
                </dd>
              </div>
              {subreddit.creatorId === session?.user.id && (
                <div className="flex justify-between gap-x-4 py-3">
                  <p className="text-gray-500">You created this community</p>
                </div>
              )}

              {session?.user.id && session.user.id !== subreddit.creatorId && (
                <SubcribeLeaveToggle
                  subredditName={subreddit.name}
                  currentlySubscribed={userSubscribedSubreddit}
                  subredditId={subreddit.id}
                />
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
