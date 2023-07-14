'use client';
import React, { FC, startTransition } from 'react';
import { Button } from './ui/Button';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { SubcribeToSubredditValidator } from '@/lib/validator/subscribeSubreddit';
import { TypeOf } from 'zod';
import { useCustomToasts } from '@/hooks/use-custom-toasts';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface SubcribeLeaveToggleProps extends SubscribeToSubredditPayload {
  currentlySubscribed?: boolean;
  subredditName: string;
}

type SubscribeToSubredditPayload = TypeOf<typeof SubcribeToSubredditValidator>;

export const SubcribeLeaveToggle: FC<SubcribeLeaveToggleProps> = ({
  currentlySubscribed,
  subredditId,
  subredditName,
}) => {
  const { loginToast } = useCustomToasts();
  const router = useRouter();
  const { mutate: subscribeUser, isLoading: processingSubcribeRequest } =
    useMutation({
      mutationFn: async (payload: SubscribeToSubredditPayload) => {
        const { subredditId } = SubcribeToSubredditValidator.parse(payload);
        const { data } = await axios.post<string>(`/api/subreddit/subscribe`, {
          subredditId,
        });

        return data;
      },

      onSuccess: () => {
        startTransition(() => {
          router.refresh();
        });

        return toast({
          title: 'Subscribe',
          description: `You are now subscribed to r/${subredditName}`,
        });
      },

      onError: (error) => {
        if (Object(error) instanceof AxiosError) {
          let axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            return loginToast();
          }
        }

        return toast({
          title: 'There was a problem',
          description: 'Something went wrong, please try again',
          variant: 'destructive',
        });
      },
    });

  const { mutate: unsubscribeUser, isLoading: processingUnsubscribeRequest } =
    useMutation({
      mutationFn: async (payload: SubscribeToSubredditPayload) => {
        const { subredditId } = SubcribeToSubredditValidator.parse(payload);
        await axios.delete(`/api/subreddit/${subredditId}/unsubscribe`);
      },

      onSuccess: () => {
        startTransition(() => {
          router.refresh();
        });

        return toast({
          title: 'Unsubcribe',
          description: `You have now unsubscribed from r/${subredditName}`,
        });
      },

      onError: (error) => {
        if (Object(error) instanceof AxiosError) {
          let axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            return loginToast();
          }
        }

        return toast({
          title: 'There was a problem',
          description: 'Something went wrong, please try again',
          variant: 'destructive',
        });
      },
    });

  return currentlySubscribed ? (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={processingSubcribeRequest}
      onClick={() => unsubscribeUser({ subredditId })}
    >
      Leave community
    </Button>
  ) : (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={processingUnsubscribeRequest}
      onClick={() => subscribeUser({ subredditId })}
    >
      Join to post
    </Button>
  );
};
