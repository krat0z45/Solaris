
"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import ProjectActions from "@/components/projects/project-actions";
import { cn, formatDate } from "@/lib/utils";
import { useMemo } from "react";
import type { Client, Project } from "@/lib/types";
import { Loader2 } from "lucide-react";
import React from "react";

function ProjectCard({ project, clientName, getStatusColor }: { project: Project, clientName: string | undefined, getStatusColor: (s:string) => string }) {
  return (
    <Link href={`/projects/${project.id}`} className="block hover:-translate-y-1 transition-transform">
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant="outline" className={cn("whitespace-nowrap", getStatusColor(project.status))}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
           <p className="text-sm text-muted-foreground truncate">
            <span className="font-medium text-foreground">Client:</span> {clientName || 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Manager ID:</span> {project.managerId}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Start Date:</span> {formatDate(project.startDate)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'On Track': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'At Risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Off Track': return 'bg-red-100 text-red-800 border-red-200';
        case 'On Hold': return 'bg-slate-100 text-slate-800 border-slate-200';
        case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function ProjectList() {
    const firestore = useFirestore();
    const { user, isUserLoading: isAuthLoading } = useUser();

    // The query for projects is now conditional based on the user's role.
    const projectsQuery = useMemo(() => {
        if (!user) return null;
        
        const projectsCollection = collection(firestore, "projects");
        
        // If the user is a manager, only query for projects assigned to them.
        if (user.role === 'manager') {
            return query(projectsCollection, where("managerId", "==", user.uid));
        }

        // If the user is an admin, query all projects.
        return query(projectsCollection);
    }, [firestore, user]);

    const { data: projects, isLoading: projectsLoading, error: projectsError } = useCollection<Project>(projectsQuery, { 
        disabled: !projectsQuery
    });
    
    // The query for clients is only enabled for admins.
    const clientsQuery = useMemo(() => {
        if (!user || user.role !== 'admin') return null;
        return query(collection(firestore, "clients"));
    }, [firestore, user]);

    // The hook is called unconditionally, but the query is disabled for non-admins.
    const { data: allClients, isLoading: clientsLoading, error: clientsError } = useCollection<Client>(clientsQuery, { 
        disabled: user?.role !== 'admin'
    });

    const isLoading = isAuthLoading || projectsLoading || (user?.role === 'admin' && clientsLoading);

    // This useMemo hook must be called unconditionally at the top level.
    const clientMap = useMemo(() => new Map((allClients || []).map(c => [c.id, c.name])), [allClients]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    if (!user) {
        return null; // Or a login prompt
    }
    
    if (projectsError) {
        return <div className="text-destructive p-4 rounded-md bg-destructive/10">Error loading projects: {projectsError.message}</div>
    }
    
    // We only care about client errors for admins, as managers won't fetch them.
    if (clientsError && user.role === 'admin') {
        return <div className="text-destructive p-4 rounded-md bg-destructive/10">Error loading clients: {clientsError.message}</div>
    }

    if (!projects || projects.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No Projects Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {user.role === 'manager' ? 'You have not been assigned any projects yet.' : 'Get started by creating your first project.'}
            </p>
            <ProjectActions />
        </div>
      )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              clientName={clientMap.get(project.clientId)} 
              getStatusColor={getStatusColor} 
            />
          ))}
        </div>
    );
}

    