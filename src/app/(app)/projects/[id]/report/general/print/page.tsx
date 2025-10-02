'use client';

import { useDoc, useCollection, useFirestore } from '@/firebase';
import { notFound, useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { Client, Project, User, WeeklyReport } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import PrintGeneralReportView from '@/components/projects/print-general-report-view';
import { collection, doc, query } from 'firebase/firestore';

export default function PrintGeneralReportPage() {
  const params = useParams();
  const projectId = params.id as string;
  const firestore = useFirestore();

  const projectRef = useMemo(() => doc(firestore, 'projects', projectId), [firestore, projectId]);
  const { data: project, isLoading: projectLoading } = useDoc<Project>(projectRef);

  const clientRef = useMemo(() => (project ? doc(firestore, 'clients', project.clientId) : null), [firestore, project]);
  const { data: client, isLoading: clientLoading } = useDoc<Client>(clientRef, { disabled: !project });

  const managerRef = useMemo(() => (project ? doc(firestore, 'users', project.managerId) : null), [firestore, project]);
  const { data: manager, isLoading: managerLoading } = useDoc<User>(managerRef, { disabled: !project });
  
  const reportsQuery = useMemo(() => query(collection(firestore, `projects/${projectId}/weeklyReports`)),[firestore, projectId]);
  const { data: reports, isLoading: reportsLoading } = useCollection<WeeklyReport>(reportsQuery);

  const isLoading = projectLoading || clientLoading || managerLoading || reportsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <PrintGeneralReportView
      project={project}
      client={client || null}
      manager={manager || null}
      reports={reports || []}
    />
  );
}
