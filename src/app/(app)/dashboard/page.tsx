
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ListChecks, Users, AlertTriangle } from 'lucide-react';
import DashboardProjectList from '@/components/dashboard/dashboard-project-list';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  const stats = [
    { title: 'Total Projects', valueKey: 'total', icon: BarChart, color: 'text-primary' },
    { title: 'Active Clients', valueKey: 'clients', icon: Users, color: 'text-emerald-500' },
    { title: 'Completed Projects', valueKey: 'completed', icon: ListChecks, color: 'text-blue-500' },
    { title: 'Projects At Risk', valueKey: 'atRisk', icon: AlertTriangle, color: 'text-yellow-500' },
  ];

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.displayName?.split(' ')[0] || 'friend'}!</h1>
          <p className="text-muted-foreground">Here's a snapshot of your projects today.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <DashboardStats statKey={stat.valueKey as any} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Recent Projects</h2>
        <DashboardProjectList />
      </div>
    </div>
  );
}
