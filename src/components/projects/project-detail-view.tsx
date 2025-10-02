
'use client';

import { useDoc, useCollection, useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { notFound, useRouter } from 'next/navigation';
import PageHeader from '@/components/page-header';
import ProjectActions from '@/components/projects/project-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import { Briefcase, Calendar, User, Building, CalendarClock, Loader2, ShieldAlert, Printer, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { collection, doc, query, orderBy, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import type { Client, Project, WeeklyReport } from '@/lib/types';
import ProjectProgressChart from '@/components/projects/project-progress-chart';
import GeneralReportView from './general-report-view';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

function AccessDenied() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-10">
      <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      <p className="text-muted-foreground mb-6">You do not have permission to view this project.</p>
      <Button onClick={() => router.push('/projects')}>Return to Projects</Button>
    </div>
  );
}

export default function ProjectDetailView({ projectId }: { projectId: string }) {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const projectRef = useMemo(() => doc(firestore, "projects", projectId), [firestore, projectId]);
  const { data: project, isLoading: projectLoading, error: projectError } = useDoc<Project>(projectRef);

  const clientRef = useMemo(() => project ? doc(firestore, "clients", project.clientId) : null, [firestore, project]);
  const { data: client, isLoading: clientLoading } = useDoc<Client>(clientRef, { disabled: !project });

  const reportsQuery = useMemo(() => query(collection(firestore, `projects/${projectId}/weeklyReports`), orderBy('week', 'asc')), [firestore, projectId]);
  const { data: reports, isLoading: reportsLoading } = useCollection<WeeklyReport>(reportsQuery);

  const isLoading = projectLoading || clientLoading || reportsLoading || isAuthLoading;

  const handleDeleteProject = async () => {
    if (!firestore || !project) return;
    setIsDeleting(true);
    
    const projectDocRef = doc(firestore, 'projects', project.id);
    const reportsColRef = collection(firestore, `projects/${project.id}/weeklyReports`);

    try {
        // Firestore transactions are good for atomicity but can be slow for many docs.
        // A write batch is better for bulk deleting.
        const batch = writeBatch(firestore);

        // 1. Get all weekly reports to delete them
        const reportsSnapshot = await getDocs(reportsColRef);
        reportsSnapshot.forEach(reportDoc => {
            batch.delete(reportDoc.ref);
        });

        // 2. Delete the project document itself
        batch.delete(projectDocRef);

        // 3. Commit the batch
        await batch.commit();

        toast({
            title: "Project Deleted",
            description: `The project "${project.name}" and all its reports have been permanently removed.`,
        });

        router.push('/projects');

    } catch (e: any) {
        if (e.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `projects/${project.id} and its subcollections`,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: e.message || "An unexpected error occurred while deleting the project.",
            });
        }
        setIsDeleting(false);
    }
  };

  const { timeProgress, daysRemaining } = useMemo(() => {
    if (!project) return { timeProgress: 0, daysRemaining: 0 };
    const startDate = parseISO(project.startDate);
    const endDate = parseISO(project.estimatedEndDate);
    const today = new Date();
    
    const totalDuration = differenceInDays(endDate, startDate);
    const elapsedDuration = differenceInDays(today, startDate);
    
    let progress = 0;
    if (totalDuration > 0) {
      progress = Math.round((elapsedDuration / totalDuration) * 100);
    }

    const remaining = differenceInDays(endDate, today);

    return {
      timeProgress: Math.max(0, Math.min(100, progress)),
      daysRemaining: Math.max(0, remaining),
    };
  }, [project]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (projectError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-10">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You do not have permission to view this project.</p>
          <Button onClick={() => router.push('/projects')}>Return to Projects</Button>
        </div>
      );
  }

  if (!project) {
    notFound();
  }
  
  const isManagerOrAdmin = user?.role === 'admin' || user?.uid === project.managerId;


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700';
      case 'At Risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700';
      case 'Off Track': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const projectDetails = [
    { label: "Client", value: client?.name || 'N/A', icon: Building },
    { label: "Project Manager ID", value: project.managerId, icon: User },
    { label: "Start Date", value: formatDate(project.startDate), icon: Calendar },
    { label: "Estimated End Date", value: formatDate(project.estimatedEndDate), icon: CalendarClock },
    { label: "Project Type", value: project.projectType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), icon: Briefcase },
  ];
  
  const latestReport = reports?.[reports.length - 1];
  const overallProgress = latestReport?.progress ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title={project.name} description={`Details for project #${project.id.substring(0,6)}...`}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Print Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/projects/${project.id}/report/general/print`} target="_blank">Print General Report</Link>
                </DropdownMenuItem>
                {reports && reports.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Print Weekly Report</DropdownMenuLabel>
                        {reports.map(report => (
                             <DropdownMenuItem key={report.id} asChild>
                                <Link href={`/projects/${project.id}/report/${report.week}/print?reportId=${report.id}`} target="_blank">
                                    Report #{report.week}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
        {isManagerOrAdmin && <ProjectActions project={project} />}
      </PageHeader>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="reports">Weekly Reports</TabsTrigger>
          <TabsTrigger value="general">General Report</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  {projectDetails.map(detail => (
                    <div key={detail.label} className="flex items-start gap-3">
                      <detail.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{detail.label}</p>
                        <p className="font-medium">{detail.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {isManagerOrAdmin && (
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete this project</p>
                                <p className="text-sm text-muted-foreground">This action is irreversible. All associated data, including weekly reports, will be permanently deleted.</p>
                            </div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isDeleting}>
                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Delete Project
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the project "{project.name}" and all of its associated weekly reports.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteProject}
                                            className="bg-destructive hover:bg-destructive/90"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Yes, delete project'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className={cn("text-base", getStatusColor(project.status))}>{project.status}</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Progress value={overallProgress} aria-label={`${overallProgress}% complete`} />
                      <span className="text-lg font-bold">{overallProgress}%</span>
                    </div>
                    {latestReport ? (
                      <p className="text-sm text-muted-foreground">
                        Last updated in week {latestReport.week} report.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No progress reported yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Time Elapsed</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Progress value={timeProgress} aria-label={`${timeProgress}% of time elapsed`} />
                      <span className="text-lg font-bold">{timeProgress}%</span>
                    </div>
                     <p className="text-sm text-muted-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} days remaining.` : 'Past due date.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
         <TabsContent value="progress" className="mt-6">
           <ProjectProgressChart reports={reports || []} project={project} />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Submitted Reports</CardTitle>
              {isManagerOrAdmin && <Button asChild>
                <Link href={`/projects/${project.id}/report/${(reports?.length || 0) + 1}`}>New Report</Link>
              </Button>}
            </CardHeader>
            <CardContent>
              {reports && reports.length > 0 ? (
                <div className="divide-y divide-border -mx-6">
                  {reports.map(report => (
                    <div key={report.id} className="px-6 py-4 hover:bg-muted/50 transition-colors flex justify-between items-center">
                      <div>
                        <Link href={`/projects/${project.id}/report/${report.week}?reportId=${report.id}`} className="font-medium text-primary hover:underline">Report #{report.week}</Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">{report.summary}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {report.status && <Badge variant="outline" className={cn(getStatusColor(report.status))}>{report.status}</Badge>}
                        {isManagerOrAdmin && <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}/report/${report.week}?reportId=${report.id}`}>View/Edit</Link>
                        </Button>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No weekly reports have been submitted for this project yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="general" className="mt-6">
          <GeneralReportView project={project} reports={reports || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
