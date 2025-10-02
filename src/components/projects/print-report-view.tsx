
"use client";

import { useDoc, useFirestore } from "@/firebase";
import { getClientById, getProjectById, getUserById } from "@/lib/firebase-data";
import { notFound } from "next/navigation";
import { CheckSquare, Square, Loader2 } from 'lucide-react';
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import type { Client, Project, User, WeeklyReport, Milestone } from "@/lib/types";

export default function PrintReportView({ projectId, reportNumber, reportId }: { projectId: string, reportNumber: number, reportId?: string }) {
  const firestore = useFirestore();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [manager, setManager] = useState<User | null>(null);
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reportRef = useMemo(() => {
    if (!reportId) return null;
    return doc(firestore, `projects/${projectId}/weeklyReports`, reportId);
  }, [firestore, projectId, reportId]);
  
  const { data: report, isLoading: reportLoading } = useDoc<WeeklyReport>(reportRef, {
      disabled: !reportRef
  });

  useEffect(() => {
    const fetchData = async () => {
      // This effect now depends on the report being loaded if a reportId is provided.
      if (reportId && report === null) {
          // If we have an ID but the report isn't loaded (or doesn't exist), don't proceed.
          // Note: useDoc handles the non-existent case by returning null.
          if (!reportLoading) {
            notFound();
          }
          return;
      }
      
      setIsLoading(true);
      const proj = await getProjectById(firestore, projectId);
      if (!proj) {
        notFound();
        return;
      }
      setProject(proj);

      const [clientData, managerData, milestonesSnapshot] = await Promise.all([
        getClientById(firestore, proj.clientId),
        getUserById(firestore, proj.managerId),
        getDocs(query(collection(firestore, "milestones"), where("projectType", "==", proj.projectType)))
      ]);

      setClient(clientData || null);
      setManager(managerData || null);
      setProjectMilestones(milestonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
      
      setIsLoading(false);
    };

    if (!reportLoading) {
      fetchData();
    }
  }, [firestore, projectId, reportId, report, reportLoading]);

  const finalIsLoading = reportLoading || isLoading;

  if (finalIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Report #{reportNumber} has not been created or found.</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solaris Manager</h1>
          <p className="text-gray-600">Weekly Progress Report</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">{project.name}</h2>
          <p className="text-gray-600">Report #{report.week}</p>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-8 my-8">
        <div>
          <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">Client</h3>
          <p className="text-lg">{client?.name}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">Project Manager</h3>
          <p className="text-lg">{manager?.name}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">Start Date</h3>
          <p className="text-lg">{formatDate(project.startDate)}</p>
        </div>
         <div>
          <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">Total Progress</h3>
          <p className="text-lg font-bold">{report.progress}%</p>
        </div>
      </section>

      <main className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4 flex justify-between items-center">
            Weekly Summary
            <Badge className={
                report.status === 'On Track' ? 'bg-green-100 text-green-800' :
                report.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
            }>{report.status}</Badge>
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">{report.summary}</p>
        </div>

        <div>
            <h3 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Milestones Status for this Report</h3>
            <div className="space-y-2">
                {projectMilestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-3">
                        {report.milestones.includes(milestone.id) ? 
                            <CheckSquare className="h-5 w-5 text-green-600" /> :
                            <Square className="h-5 w-5 text-gray-300" />
                        }
                        <span>{milestone.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </main>

      <footer className="mt-12 pt-4 border-t text-center text-xs text-gray-500">
        <p>Report generated on {new Date().toLocaleDateString()}</p>
        <p>Solaris Manager - Project Management Simplified</p>
      </footer>
    </div>
  );
}
