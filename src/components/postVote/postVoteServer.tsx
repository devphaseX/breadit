import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { PostStats } from '@/app/api/posts/route';
import { VoteType } from '@prisma/client';
import { PostVoteClient } from './postVoteClient';

type PostVoteServerWithStaticData = {
  initialVotesAmt: number;
  intialVote: VoteType | null;
};

type PostVoteServerWithFetchFn = {
  getPostData: (userId?: string) => Promise<PostStats | null>;
};

type PostVoteServerProps = (
  | PostVoteServerWithStaticData
  | PostVoteServerWithFetchFn
) & { postId: string };

const PostVoteServer = async (props: PostVoteServerProps) => {
  const session = await getAuthSession();

  let _votesAmt: number = 0;
  let _currentVote: VoteType | null = null;

  if ('getPostData' in props) {
    const post = await props.getPostData();
    // await new Promise<void>((res) => setTimeout(() => res(), 2000));
    if (!post) return null;

    _votesAmt = post.votesInfo.participants;

    _currentVote =
      post.votes?.find((post) => post.userId === session?.user.id)?.type ??
      null;
  } else {
    _votesAmt = props.initialVotesAmt;
    _currentVote = props.intialVote;
  }

  return (
    <PostVoteClient
      postId={props.postId}
      initialVoteParticipants={_votesAmt}
      initialUserVoteType={_currentVote}
    />
  );
};

export { PostVoteServer };
