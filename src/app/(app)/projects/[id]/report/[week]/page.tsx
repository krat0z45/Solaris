
'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/page-header";
import ReportFormLoader from "@/components/projects/report-form-loader";
import { Button } from "@/components/ui/button";
import { getProjectById } from "@/lib/firebase-data";
import { Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { useFirestore } from "@/firebase";
import type { Project } from "@/lib/types";

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const week = params.week as string;
  const reportId = searchParams.get('reportId');

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();
  
  const reportNumber = week === 'general' ? 0 : parseInt(week, 10);


  useEffect(() => {
    if (isNaN(reportNumber)) {
      notFound();
      return;
    }
    
    const fetchProject = async () => {
      if (!firestore) return;
      const projectData = await getProjectById(firestore, id);
      if (!projectData) {
        notFound();
      } else {
        setProject(projectData);
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [firestore, id, reportNumber]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!project) {
    return null;
  }

  const printLink = reportId 
    ? `/projects/${project.id}/report/${reportNumber}/print?reportId=${reportId}`
    : `/projects/${project.id}/report/${reportNumber}/print`;


  return (
    <div className="space-y-6">
      <PageHeader
        title={reportId ? `Edit Report #${reportNumber}` : `New Report #${reportNumber}`}
        description={`Log progress for ${project.name}.`}
      >
        <Button variant="outline" asChild>
          <Link href={printLink} target="_blank">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Link>
        </Button>
      </PageHeader>
      <ReportFormLoader project={project} reportNumber={reportNumber} reportId={reportId} />
    </div>
  );
}
