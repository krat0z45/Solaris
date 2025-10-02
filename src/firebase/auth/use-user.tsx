
"use client";

import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase/provider';
import { type User as AuthUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';

export interface UserHookResult {
  user: (AuthUser & AppUser) | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
  const auth = useAuth();
  const firestore = useFirestore();

  const [user, setUser] = useState<(AuthUser & AppUser) | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth || !firestore) {
      // Services not yet available, do nothing.
      return;
    }

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setIsUserLoading(true);
        
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        
        // Subscribe to the user's profile document in Firestore
        const profileUnsubscribe = onSnapshot(userDocRef, async (userDoc) => {
          try {
            // Get the ID token result to access custom claims
            const idTokenResult = await firebaseUser.getIdTokenResult();
            const tokenRole = idTokenResult.claims.role as AppUser['role'] | undefined;

            let appUser: AppUser;

            if (userDoc.exists()) {
              // User profile exists in Firestore, use its data
              appUser = { id: userDoc.id, ...userDoc.data() } as AppUser;
            } else {
              // Fallback for when the user doc hasn't been created yet
              appUser = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'New User',
                email: firebaseUser.email || '',
                role: 'manager' // Default role if no document exists
              };
            }

            // Merge the Auth user object with the App user profile.
            // **Crucially, prioritize the role from the token claims if it exists,
            // otherwise, use the role from the Firestore document.**
            setUser({
              ...firebaseUser,
              ...appUser,
              role: tokenRole || appUser.role,
            });

            setUserError(null);
          } catch (error) {
            console.error("Error processing user data:", error);
            setUserError(error as Error);
            setUser(null);
          } finally {
            // Mark loading as complete only after all data is processed
            setIsUserLoading(false);
          }
        }, (error) => {
          // This handles errors during the onSnapshot subscription itself
          console.error("Error fetching user document:", error);
          setUserError(error);
          setUser(null);
          setIsUserLoading(false);
        });

        // Return a cleanup function to unsubscribe from the profile listener
        return () => profileUnsubscribe();
      } else {
        // No Firebase user is signed in
        setUser(null);
        setIsUserLoading(false);
        setUserError(null);
      }
    });

    // Return a cleanup function to unsubscribe from the auth state listener
    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return { user, isUserLoading, userError };
};
