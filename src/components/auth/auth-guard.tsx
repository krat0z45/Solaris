
'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    // Wait until the user loading process is complete before doing anything.
    if (isUserLoading) {
      return;
    }

    // If there is no user and the current page is not a public auth page,
    // redirect them to the login page.
    if (!user && !isAuthPage) {
      router.replace('/login');
    }

    // If there is a user and they are on an auth page (login/register),
    // redirect them to the dashboard.
    if (user && isAuthPage) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, pathname, router, isAuthPage]);

  // While loading, or if a redirect is imminent, show a full-screen loader.
  // This prevents content from flashing.
  if (isUserLoading || (!user && !isAuthPage) || (user && isAuthPage)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If the state is correct (e.g., user is present on a protected page, or no user on public page), render the children.
  return <>{children}</>;
}
