
'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/page-header';
import ProfileProjectStats from '@/components/profile/profile-project-stats';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No user is signed in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage your personal information."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                    These are your account details. This information is read-only for now.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                    <AvatarFallback className="text-3xl">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{user.displayName}</h2>
                    <p className="text-muted-foreground">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={user.displayName || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={user.email || ''} readOnly />
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <ProfileProjectStats user={user} />
        </div>
      </div>
    </div>
  );
}
