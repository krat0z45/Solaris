
'use client';

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Project, WeeklyReport } from '@/lib/types';
import { differenceInWeeks, parseISO, startOfWeek, addWeeks } from 'date-fns';

interface ProjectProgressChartProps {
  reports: WeeklyReport[];
  project: Project;
}

export default function ProjectProgressChart({ reports, project }: ProjectProgressChartProps) {
  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No progress reports submitted yet.</p>
        </CardContent>
      </Card>
    );
  }

  const startDate = parseISO(project.startDate);
  const endDate = parseISO(project.estimatedEndDate);
  const totalWeeks = differenceInWeeks(endDate, startDate);

  const chartData = reports.map((report, index) => {
    // Calculate planned progress for the S-curve
    const currentWeekNumber = report.week - 1; // Use sequential report number (0-indexed)
    const plannedProgress = Math.min(100, Math.round((currentWeekNumber / totalWeeks) * 100));
    
    // Calculate weekly progress
    const previousProgress = index > 0 ? reports[index - 1].progress : 0;
    const weeklyProgress = report.progress - previousProgress;

    return {
      week: `R${report.week}`,
      'Actual Progress': report.progress,
      'Planned Progress': plannedProgress,
      'Weekly Incremental Progress': weeklyProgress < 0 ? 0 : weeklyProgress,
    };
  });

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
       <Card>
        <CardHeader>
          <CardTitle>S-Curve Progress</CardTitle>
          <CardDescription>Planned vs. Actual project completion over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="Planned Progress" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Planned" />
              <Line type="monotone" dataKey="Actual Progress" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>Incremental progress made each week.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis unit="%" />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Bar dataKey="Weekly Incremental Progress" fill="hsl(var(--accent))" name="Weekly Progress" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
