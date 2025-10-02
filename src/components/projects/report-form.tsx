
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project, WeeklyReport, Milestone } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "../ui/progress";
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, where, doc, setDoc, addDoc, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const reportSchema = z.object({
    summary: z.string().min(1, "Summary is required."),
    status: z.enum(["On Track", "At Risk", "Off Track"]),
    milestones: z.array(z.string()).optional(),
    progress: z.number().min(0).max(100),
});

type ReportFormProps = {
  project: Project;
  report: WeeklyReport;
  previouslyCompletedMilestones: string[];
};

export default function ReportForm({ project, report, previouslyCompletedMilestones }: ReportFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // === STATE INITIALIZATION ===
  const [summary, setSummary] = useState(report.summary || '');
  const [status, setStatus] = useState<WeeklyReport['status']>(report.status || 'On Track');

  // The single source of truth for which milestones are checked.
  // It starts with a combination of previously completed ones and the ones from the report being edited.
  const [checkedMilestones, setCheckedMilestones] = useState<string[]>([]);
  
  // Fetch all possible milestones for this project type.
  const milestonesQuery = useMemo(() => 
    query(collection(firestore, "milestones"), where("projectType", "==", project.projectType)), 
    [firestore, project.projectType]
  );
  const { data: projectMilestones, isLoading: milestonesLoading } = useCollection<Milestone>(milestonesQuery);

  // This effect runs ONCE when the component mounts or when the report being edited changes.
  // It correctly sets the initial state of the checkboxes.
  useEffect(() => {
    // Use a Set to merge inherited milestones with the current report's milestones, avoiding duplicates.
    const initialMilestones = new Set([
        ...previouslyCompletedMilestones, 
        ...(report.milestones || [])
    ]);
    setCheckedMilestones(Array.from(initialMilestones));
  }, [report.id, previouslyCompletedMilestones, report.milestones]);


  // === DERIVED STATE (PROGRESS CALCULATION) ===
  // The progress is ALWAYS calculated based on the current state of `checkedMilestones`.
  const progressValue = useMemo(() => {
    if (!projectMilestones || projectMilestones.length === 0) return 0;
    // The number of currently checked milestones / total possible milestones for this project type.
    return Math.round((checkedMilestones.length / projectMilestones.length) * 100);
  }, [checkedMilestones, projectMilestones]);


  // === EVENT HANDLERS ===
  const handleCheckboxChange = (milestoneId: string, checked: boolean) => {
    // This logic is now purely about updating the component's state.
    // The `disabled` prop on the checkbox already prevents unchecking inherited milestones.
    setCheckedMilestones(prev => 
      checked ? [...prev, milestoneId] : prev.filter(id => id !== milestoneId)
    );
  };
  
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if all milestones are completed
    if (projectMilestones && checkedMilestones.length === projectMilestones.length && project.status !== 'Completed') {
      setShowCompletionDialog(true);
    } else {
      await saveReportAndProject();
    }
  };
  
  const saveReportAndProject = async (markProjectAsCompleted = false) => {
    if (!firestore) return;
    setIsSubmitting(true);
    setShowCompletionDialog(false);

    const reportDataForValidation = {
      summary,
      status,
      milestones: checkedMilestones,
      progress: progressValue, // Use the dynamically calculated progress.
    };

    const validatedFields = reportSchema.safeParse(reportDataForValidation);

    if (!validatedFields.success) {
      const errorMessage = Object.values(validatedFields.error.flatten().fieldErrors).flat().join("\n");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage || "Please check the form fields.",
      });
      setIsSubmitting(false);
      return;
    }

    const finalReportData = {
      projectId: report.projectId,
      week: report.week,
      createdAt: report.id ? report.createdAt : new Date().toISOString(),
      ...validatedFields.data,
    };
    
    const isNewReport = !report.id;
    const reportsCollectionRef = collection(firestore, `projects/${project.id}/weeklyReports`);
    const reportPromise = isNewReport 
        ? addDoc(reportsCollectionRef, finalReportData) 
        : updateDoc(doc(reportsCollectionRef, report.id!), finalReportData);

    const promises = [reportPromise];

    if (markProjectAsCompleted) {
        const projectRef = doc(firestore, 'projects', project.id);
        const projectUpdatePromise = updateDoc(projectRef, { status: 'Completed' });
        promises.push(projectUpdatePromise);
    }

    try {
      await Promise.all(promises);
      toast({
        title: "Success",
        description: `Report ${isNewReport ? 'created' : 'updated'} and project status ${markProjectAsCompleted ? 'set to Completed' : 'remains unchanged'}.`,
      });
      router.push(`/projects/${project.id}`);
    } catch (e: any) {
        // Generic error handling, can be made more specific for each promise if needed
        const isPermissionError = e.code === 'permission-denied';
        
        if (isPermissionError) {
             const permissionError = new FirestorePermissionError({
                path: 'Multiple operations',
                operation: 'write',
                requestResourceData: { report: finalReportData, projectUpdate: markProjectAsCompleted ? { status: 'Completed' } : undefined },
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
             toast({
                variant: "destructive",
                title: "Error",
                description: e.message || `An unexpected error occurred.`,
            });
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  // === RENDER LOGIC ===
  if (milestonesLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Weekly Summary</CardTitle></CardHeader>
              <CardContent>
                <Textarea
                  id="summary"
                  name="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide a detailed summary of this week's progress, challenges, and next steps."
                  rows={10}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Completed Milestones Checklist</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectMilestones && projectMilestones.length > 0 ? (
                    projectMilestones.map((milestone) => {
                      const isPreviouslyCompleted = previouslyCompletedMilestones.includes(milestone.id);
                      return (
                          <div key={milestone.id} className="flex items-center space-x-3">
                          <Checkbox
                              id={`milestone-${milestone.id}`}
                              name="milestones"
                              value={milestone.id}
                              checked={checkedMilestones.includes(milestone.id)}
                              onCheckedChange={(checked) => handleCheckboxChange(milestone.id, !!checked)}
                              disabled={isPreviouslyCompleted}
                          />
                          <div className="grid gap-1.5 leading-none">
                              <label htmlFor={`milestone-${milestone.id}`} className={`font-medium ${isPreviouslyCompleted ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}>
                              {milestone.name}
                              </label>
                              <p className="text-xs text-muted-foreground">{milestone.description}</p>
                          </div>
                          </div>
                      );
                    })
                  ) : (
                      <p className="text-muted-foreground text-sm">No milestone templates found for the "{project.projectType}" project type. You can add them in the Milestones section.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Weekly Status</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup name="status" value={status} onValueChange={(value) => setStatus(value as WeeklyReport['status'])} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="On Track" id="on-track" />
                    <Label htmlFor="on-track">On Track</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="At Risk" id="at-risk" />
                    <Label htmlFor="at-risk">At Risk</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Off Track" id="off-track" />
                    <Label htmlFor="off-track">Off Track</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Overall Project Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={progressValue} aria-label="Project progress" />
                  <span className="font-bold text-lg w-16 text-right tabular-nums">{progressValue}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Progress is calculated automatically based on completed milestones.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Report"}
          </Button>
        </div>
      </form>
      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Project Completion</AlertDialogTitle>
            <AlertDialogDescription>
              You have marked all milestones as complete. Do you want to update the project's final status to "Completed"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => saveReportAndProject(false)} disabled={isSubmitting}>
              Just Save Report
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => saveReportAndProject(true)} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Confirm & Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
