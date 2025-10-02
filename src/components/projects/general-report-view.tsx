
"use client";

import { useMemo } from "react";
import type { Project, WeeklyReport, Milestone } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Loader2, CheckSquare, Square } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface GeneralReportViewProps {
  project: Project;
  reports: WeeklyReport[];
}

export default function GeneralReportView({ project, reports }: GeneralReportViewProps) {
  const firestore = useFirestore();

  const allCompletedMilestones = useMemo(() => {
    const milestoneIds = new Set<string>();
    reports.forEach(report => {
      report.milestones.forEach(id => milestoneIds.add(id));
    });
    return Array.from(milestoneIds);
  }, [reports]);

  const milestonesQuery = useMemo(() => 
    query(collection(firestore, "milestones"), where("projectType", "==", project.projectType)), 
    [firestore, project.projectType]
  );
  const { data: projectMilestones, isLoading: milestonesLoading } = useCollection<Milestone>(milestonesQuery);

  const latestReport = reports[reports.length - 1];
  const overallProgress = latestReport?.progress ?? 0;

  if (milestonesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Report</CardTitle>
          <CardDescription>A consolidated summary of the project's progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No reports have been submitted yet to generate a general report.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Report</CardTitle>
          <CardDescription>A consolidated summary of the project's progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
               <div className="flex items-center gap-2 mt-1">
                  <Progress value={overallProgress} className="h-2" />
                  <span className="text-lg font-bold">{overallProgress}%</span>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Final Status</p>
              <Badge className="text-lg mt-1">{project.status}</Badge>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Reports Submitted</p>
              <p className="text-2xl font-bold">{reports.length}</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Milestones Completed</p>
              <p className="text-2xl font-bold">{allCompletedMilestones.length} / {projectMilestones?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Completed Milestones</CardTitle>
            <CardDescription>A complete checklist of all milestones achieved during the project.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-3">
              {projectMilestones?.map(milestone => {
                const isCompleted = allCompletedMilestones.includes(milestone.id);
                return (
                  <div key={milestone.id} className="flex items-start gap-3">
                    {isCompleted ? <CheckSquare className="h-5 w-5 mt-px text-primary" /> : <Square className="h-5 w-5 mt-px text-muted-foreground/50" />}
                    <div>
                      <p className={`font-medium ${!isCompleted && "text-muted-foreground/80"}`}>{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                )
              })}
             </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summaries Log</CardTitle>
            <CardDescription>A chronological log of all summary notes from weekly reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="border-l-2 pl-4">
                <p className="font-semibold text-sm">Week {report.week}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.summary}</p>
              </div>
            )).reverse()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
