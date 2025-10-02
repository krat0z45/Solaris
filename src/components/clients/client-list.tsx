
"use client";

import { useCollection, useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, doc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Loader2, AlertTriangle, Trash2, ShieldX } from "lucide-react";
import { useMemo, useState } from "react";
import type { Client } from "@/lib/types";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ClientListDisplay({ clients }: { clients: Client[] }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteClient = (clientId: string) => {
    if (!firestore) return;
    setIsDeleting(clientId);
    const clientRef = doc(firestore, "clients", clientId);

    deleteDoc(clientRef)
      .then(() => {
        toast({
          title: "Client Deleted",
          description: "The client has been successfully deleted.",
        });
      })
      .catch((e) => {
        if (e.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: clientRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          toast({
            variant: "destructive",
            title: "Error Deleting Client",
            description: e.message || "An unexpected error occurred.",
          });
        }
      })
      .finally(() => {
        setIsDeleting(null);
      });
  };

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-medium">No Clients Found</h3>
        <p className="text-sm text-muted-foreground">
          Get started by adding your first client.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <Card key={client.id} className="flex flex-col">
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.avatarUrl} alt={client.name} />
              <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{client.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${client.email}`} className="hover:text-primary">
                {client.email}
              </a>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={isDeleting === client.id}>
                  {isDeleting === client.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the client "{client.name}".
                    <div className="mt-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start">
                            <ShieldX className="h-5 w-5 mr-3 mt-1 text-yellow-600 dark:text-yellow-400"/>
                            <div>
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Warning</h4>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    Deleting this client will NOT delete their associated projects. You must reassign or delete them manually.
                                </p>
                            </div>
                        </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteClient(client.id)} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete client
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-destructive/50 bg-destructive/5 text-destructive">
            <div className="flex justify-center">
                <AlertTriangle className="h-8 w-8 mb-4" />
            </div>
            <h3 className="text-lg font-medium">Permission Denied</h3>
            <p className="text-sm">
                You do not have permission to view the list of clients.
            </p>
            <p className="text-xs mt-2">
                (Error: {error.message})
            </p>
        </div>
    )
}

export default function ClientList() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();

  const clientsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "clients"));
  }, [firestore, user]);

  const { data: clients, isLoading: isDataLoading, error } = useCollection<Client>(clientsQuery, {
    disabled: !user
  });

  const isLoading = isAuthLoading || (user && isDataLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!user) {
    return null; // or a login prompt
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return <ClientListDisplay clients={clients || []} />;
}
