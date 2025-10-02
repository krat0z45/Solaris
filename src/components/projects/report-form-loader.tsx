
"use client";

import ReportForm from "@/components/projects/report-form";
import { useCollection, useDoc, useFirestore } from "@/firebase";
import type { Project, WeeklyReport } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import { useMemo } from "react";
import { notFound } from "next/navigation";

export default function ReportFormLoader({ project, reportNumber, reportId }: { project: Project; reportNumber: number; reportId: string | null }) {
  const firestore = useFirestore();

  // 1. Fetch the specific report to edit, if an ID is provided.
  const reportToEditRef = useMemo(() => {
    if (!firestore || !project.id || !reportId) return null;
    return doc(firestore, `projects/${project.id}/weeklyReports`, reportId);
  }, [firestore, project.id, reportId]);

  const { data: reportToEdit, isLoading: isLoadingReportToEdit, error: reportError } = useDoc<WeeklyReport>(reportToEditRef);

  // 2. Query for all reports from weeks prior to the current one to find inherited milestones.
  const previousReportsQuery = useMemo(() => {
    if (!firestore || !project.id) return null;
    // If we are editing, we look for reports BEFORE the week of the report being edited.
    // If we are creating, we look for reports BEFORE the current report number.
    const weekToCompare = reportToEdit ? reportToEdit.week : reportNumber;
    return query(
      collection(firestore, `projects/${project.id}/weeklyReports`),
      where("week", "<", weekToCompare),
      orderBy("week", "desc")
    );
  }, [firestore, project.id, reportNumber, reportToEdit]);

  const { data: previousReports, isLoading: isLoadingPrevious } = useCollection<WeeklyReport>(previousReportsQuery);
  
  // 3. Consolidate all previously completed milestones into a single set.
  const previouslyCompletedMilestones = useMemo(() => {
    if (!previousReports) return [];
    const allPreviousMilestones = new Set<string>();
    previousReports.forEach(report => {
      report.milestones?.forEach(milestoneId => {
        allPreviousMilestones.add(milestoneId);
      });
    });
    return Array.from(allPreviousMilestones);
  }, [previousReports]);

  // 4. Determine loading state.
  const isLoading = isLoadingReportToEdit || isLoadingPrevious;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 5. Handle errors.
  if (reportError) {
      throw reportError;
  }
  
  // If we are in edit mode but the document wasn't found (and we're done loading), show 404.
  if (reportId && !reportToEdit) {
    notFound();
  }

  // If we are in create mode (no reportId), create a default object to pass to the form.
  const newReportObject: WeeklyReport = {
    projectId: project.id,
    week: reportNumber,
    summary: '',
    status: 'On Track',
    milestones: [],
    progress: 0, 
    createdAt: new Date().toISOString(),
  };

  return (
    <ReportForm 
        project={project} 
        report={reportToEdit || newReportObject} 
        previouslyCompletedMilestones={previouslyCompletedMilestones} 
    />
  );
}
