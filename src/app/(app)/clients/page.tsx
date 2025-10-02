
'use client';

import PageHeader from "@/components/page-header";
import ClientActions from "@/components/clients/client-actions";
import ClientList from "@/components/clients/client-list";
import { useUser } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function ClientsPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your client accounts and contacts."
      >
        {user?.role === 'admin' && <ClientActions />}
      </PageHeader>
      
      {/* 
        Conditionally render the client list.
        Only admins are allowed to see the full list of clients.
        Managers can create clients, but can only see them through their assigned projects.
      */}
      {user?.role === 'admin' ? (
        <ClientList />
      ) : (
        <Card className="mt-6">
            <CardContent className="pt-6">
                <div className="text-center py-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                    <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">Admin Access Required</h3>
                    <p className="text-sm text-muted-foreground">
                        Viewing the full client list is restricted to administrators.
                    </p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
