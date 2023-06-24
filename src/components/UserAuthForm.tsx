'use client';

import { FC, useCallback, useState } from 'react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { Icons } from './Icons';
import { useToast } from '@/hooks/use-toast';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const [isAuthing, setAuthing] = useState(false);
  const { toast } = useToast();

  const authWithGoogle = useCallback(async function authWithGoogle() {
    setAuthing(true);
    try {
      await signIn('google');
    } catch (e) {
      toast({
        title: 'There was a problem',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      });
    } finally {
      setAuthing(false);
    }
  }, []);

  return (
    <div className={cn('flex justify-center', className)} {...props}>
      <Button
        size="sm"
        disabled={isAuthing}
        className="w-full"
        onClick={authWithGoogle}
      >
        {isAuthing ? null : <Icons.google className="h-4 w-4 mr-2" />}
        Google
      </Button>
    </div>
  );
};

export { UserAuthForm };
