'use client';
import { useCustomToasts } from '@/hooks/use-custom-toasts';
import { usePrevious } from '@mantine/hooks';
import { VoteType } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { PostVoteRequest } from '@/lib/validator/voteValidator';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

type PostVoteProps = {
  postId: string;
  initialVoteParticipants: number;
  initialUserVoteType?: VoteType | null;
};

const PostVoteClient: FC<PostVoteProps> = ({
  initialVoteParticipants,
  initialUserVoteType,
  postId,
}) => {
  const { loginToast } = useCustomToasts();
  const { toast } = useToast();
  const { data } = useSession();
  const [activeVoteParticipants, setActiveVoteParticipants] = useState(
    initialVoteParticipants
  );

  const [currentUserVoteType, setCurrentUserVoteType] =
    useState(initialUserVoteType);

  useEffect(() => {
    setCurrentUserVoteType(initialUserVoteType);
  }, [initialUserVoteType]);

  const { mutate: updateUserVote, isLoading: updatingUserVote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: PostVoteRequest = { postId, voteType: type };
      return (await axios.patch<string>('/api/subreddit/post/vote', payload))
        .data;
    },

    onMutate: (nextUserVoteType) => {
      const userRemovedVote = nextUserVoteType === currentUserVoteType;
      const prevParticipants = activeVoteParticipants;
      const prevUserVoteType = currentUserVoteType;

      setActiveVoteParticipants(
        userRemovedVote
          ? nextUserVoteType === VoteType.UP
            ? activeVoteParticipants - 1
            : activeVoteParticipants + 1
          : nextUserVoteType === VoteType.UP
          ? activeVoteParticipants + 1
          : activeVoteParticipants - 1
      );

      setCurrentUserVoteType(
        currentUserVoteType === nextUserVoteType ? null : nextUserVoteType
      );

      function revertChangesOnFailed() {
        setActiveVoteParticipants(prevParticipants);
        setCurrentUserVoteType(prevUserVoteType);
      }

      return {
        currentUserVoteType,
        userRemovedVote,
        revertChangesOnFailed,
      };
    },

    onError: (error, __, context) => {
      if (context) {
        context.revertChangesOnFailed();
      }

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }

        return toast({
          title: 'An error occurred while voting',
          description: error.response?.data,
          variant: 'destructive',
        });
      }

      toast({
        title: 'Something went wrong',
        description: "Your vote wasn't registered, please try again",
        variant: 'destructive',
      });
    },

    onSuccess: (_, voteType, context) => {
      if (context) {
        if (context.userRemovedVote) {
          return toast({
            title: 'Revoked Vote',
            description: 'Your vote has being revoked',
          });
        }
      }
      toast({
        title: 'Vote Completed',
        description: `You just turn ${voteType.toLocaleLowerCase()} for the post`,
      });
    },
  });

  return (
    <div
      className="flex sm:flex-col gap-4 sm:gap-0 pre-6 sm:w-20 pb-4 sm:pb-0"
      onClick={(event) => {
        if (!data?.user) return loginToast();
        if ((event.target as HTMLElement).matches('button, button *')) {
          const clickedVoteButtonType = (event.target as HTMLElement).closest(
            'button'
          );

          accountVote: if (clickedVoteButtonType) {
            let supportedUserVoteType =
              clickedVoteButtonType.id === VoteType.UP
                ? VoteType.UP
                : clickedVoteButtonType.id === VoteType.DOWN
                ? VoteType.DOWN
                : null;

            if (supportedUserVoteType === null) {
              const parentElement = clickedVoteButtonType.parentElement;
              const buttons = parentElement?.querySelectorAll('button');

              if (!buttons || buttons.length !== 2) break accountVote;

              const upButton = buttons.item(0);

              supportedUserVoteType =
                upButton === clickedVoteButtonType
                  ? VoteType.UP
                  : VoteType.DOWN;
            }

            if (!supportedUserVoteType) return;

            updateUserVote(supportedUserVoteType);
          }
        }
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        aria-label="upvote"
        id={VoteType.UP}
        disabled={updatingUserVote}
      >
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentUserVoteType === 'UP',
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {activeVoteParticipants}
      </p>
      <Button
        size={'sm'}
        variant={'ghost'}
        aria-label="downvote"
        id={VoteType.DOWN}
        disabled={updatingUserVote}
      >
        <ArrowBigDown
          className={cn('h-5 w-5 text-zinc-700', {
            'text-red-500 fill-red-500': currentUserVoteType === 'DOWN',
          })}
        />
      </Button>
    </div>
  );
};

export { PostVoteClient };
