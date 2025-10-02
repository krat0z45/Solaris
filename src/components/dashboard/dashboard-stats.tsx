
"use client";

import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemo } from "react";
import type { Project, Client } from "@/lib/types";
import { Loader2 } from "lucide-react";

type StatKey = "total" | "clients" | "completed" | "atRisk";

interface DashboardStatsProps {
  statKey: StatKey;
}

export default function DashboardStats({ statKey }: DashboardStatsProps) {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();

  const clientsQuery = useMemo(() => {
    if (!user || user.role !== 'admin' || statKey !== 'clients') return null;
    return query(collection(firestore, "clients"));
  }, [firestore, user, statKey]);
  
  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsQuery, {
    disabled: !user || user.role !== 'admin' || statKey !== 'clients'
  });

  // Since managers can now list all projects, the query logic is simplified.
  const projectsQuery = useMemo(() => {
    if (!user || statKey === 'clients') return null;

    const projectsCollection = collection(firestore, "projects");
    const queryConstraints = [];

    // Add status filters if applicable, but no more role-based filtering needed here.
    if (statKey === 'completed') {
      queryConstraints.push(where("status", "==", "Completed"));
    } else if (statKey === 'atRisk') {
      queryConstraints.push(where("status", "==", "At Risk"));
    }

    return query(projectsCollection, ...queryConstraints);
  }, [firestore, user, statKey]);

  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery, {
    disabled: !user || statKey === 'clients',
  });

  const isLoading = isAuthLoading || (user && (statKey === 'clients' ? clientsLoading : projectsLoading));

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }

  if (!user) {
    return <div className="text-2xl font-bold">0</div>; 
  }

  let value = 0;
  if (statKey === 'clients') {
    value = user.role === 'admin' ? (clients?.length ?? 0) : 0;
  } else {
    value = projects?.length ?? 0;
  }
  
  if (statKey === 'clients' && user.role !== 'admin') {
      return <div className="text-2xl font-bold">N/A</div>;
  }

  return <div className="text-2xl font-bold">{value}</div>;
}
