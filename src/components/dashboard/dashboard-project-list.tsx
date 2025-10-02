
"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Project } from "@/lib/types";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function DashboardProjectList() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  // The query is now the same for both admin and manager, as managers can list all projects.
  const projectsQuery = useMemo(() => {
    if (!user) return null; 
    return query(collection(firestore, "projects"), orderBy("startDate", "desc"), limit(5));
  }, [firestore, user]);

  const { data: recentProjects, isLoading: isDataLoading, error } = useCollection<Project>(projectsQuery, {
    disabled: !user 
  });
  
  const isLoading = isAuthLoading || (user && isDataLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  if (error) {
    return <p className="p-4 text-destructive">Error loading projects: {error.message}</p>;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recentProjects && recentProjects.length > 0 ? (
            recentProjects.map((project: Project) => (
              <div key={project.id} className="p-4 flex justify-between items-center">
                <div>
                  <Link href={`/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link>
                  <p className="text-sm text-muted-foreground">Status: {project.status}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/projects/${project.id}`}>
                    View <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <p className="p-4 text-muted-foreground">No recent projects found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
