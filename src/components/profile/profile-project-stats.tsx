'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Project, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, Briefcase, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ProfileProjectStatsProps {
  user: User;
}

const StatCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => (
    <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const RatingStars = ({ rating }: { rating: number }) => {
    const totalStars = 5;
    const filledStars = Math.round(rating);
    return (
        <div className="flex items-center gap-1">
            {[...Array(totalStars)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-6 w-6 ${
                        i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                    }`}
                />
            ))}
        </div>
    );
};


export default function ProfileProjectStats({ user }: ProfileProjectStatsProps) {
  const firestore = useFirestore();

  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    const projectsCollection = collection(firestore, 'projects');
    if (user.role === 'manager') {
      return query(projectsCollection, where('managerId', '==', user.id));
    }
    // Admin sees all projects
    return query(projectsCollection);
  }, [firestore, user.id, user.role]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  const stats = useMemo(() => {
    if (!projects) {
      return { total: 0, completed: 0, inProgress: 0, atRisk: 0, completionRate: 0 };
    }
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    const inProgress = projects.filter(p => p.status === 'On Track' || p.status === 'Off Track').length;
    const atRisk = projects.filter(p => p.status === 'At Risk').length;
    const completionRate = total > 0 ? (completed / total) : 0;
    
    return { total, completed, inProgress, atRisk, completionRate };
  }, [projects]);
  
  const rating = useMemo(() => stats.completionRate * 5, [stats.completionRate]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Stats</CardTitle>
          <CardDescription>Analyzing project performance...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Stats</CardTitle>
        <CardDescription>
          An overview of {user.role === 'admin' ? 'all projects in the system' : 'your assigned projects'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="font-semibold text-lg">Completion Rating</h3>
                <p className="text-sm text-muted-foreground">Based on the percentage of completed projects.</p>
            </div>
            <div className="flex items-center gap-2">
                <RatingStars rating={rating} />
                <span className="text-xl font-bold tabular-nums">({stats.completionRate.toFixed(2)})</span>
            </div>
        </div>

        {projects && projects.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total Projects" value={stats.total} icon={Briefcase} />
                <StatCard title="Completed" value={stats.completed} icon={CheckCircle} />
                <StatCard title="In Progress" value={stats.inProgress} icon={Clock} />
                <StatCard title="At Risk" value={stats.atRisk} icon={AlertTriangle} />
            </div>
        ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-medium text-muted-foreground">No Projects Found</h3>
                <p className="text-sm text-muted-foreground">
                    {user.role === 'manager' ? 'You have not been assigned any projects yet.' : 'There are no projects in the system.'}
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
