"use client";

import React, { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client, Project, User } from "@/lib/types";
import { PROJECT_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useUser, useCollection, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, addDoc, updateDoc, doc, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  clientId: z.string().min(1, "Client is required."),
  managerId: z.string().min(1, "Manager ID is required."),
  projectType: z.string().min(1, "Project type is required."),
  startDate: z.string().min(1, "Start date is required."),
  estimatedEndDate: z.string().min(1, "Estimated end date is required."),
  status: z.enum(["On Track", "At Risk", "Off Track", "On Hold", "Completed"]),
});

type ProjectFormProps = {
  project?: Project;
  userRole?: 'admin' | 'manager';
  onSuccess?: () => void;
};

export default function ProjectForm({ project, userRole, onSuccess }: ProjectFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "clients"));
  }, [firestore]);

  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsQuery);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const validatedFields = projectSchema.safeParse(data);

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
    
    const projectData = { ...validatedFields.data };

    try {
      if (project) {
        // Update existing project
        const projectRef = doc(firestore, 'projects', project.id);
        updateDoc(projectRef, projectData).catch(e => {
           if (e.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: projectRef.path,
                operation: 'update',
                requestResourceData: projectData,
            });
            errorEmitter.emit('permission-error', permissionError);
           }
        });

      } else {
        // Create new project
        const projectsColRef = collection(firestore, 'projects');
        addDoc(projectsColRef, projectData).catch(e => {
            if (e.code === 'permission-denied') {
              const permissionError = new FirestorePermissionError({
                  path: projectsColRef.path,
                  operation: 'create',
                  requestResourceData: projectData,
              });
              errorEmitter.emit('permission-error', permissionError);
            }
        });
      }

      toast({
        title: "Success",
        description: `Project ${project ? 'updated' : 'created'} successfully.`,
      });
      formRef.current?.reset();
      onSuccess?.();
    } catch (e: any) {
        // This outer catch is less likely to be hit with non-blocking calls,
        // but kept as a fallback for synchronous errors.
        toast({
            variant: "destructive",
            title: "Error",
            description: e.message || `An unexpected error occurred.`,
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (clientsLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  const isManager = userRole === 'manager';

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 py-6">
      {isManager && user && <input type="hidden" name="managerId" value={user.uid} />}

      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input id="name" name="name" defaultValue={project?.name} placeholder="e.g. Innovate HQ Solar Roof" required/>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client</Label>
          <Select name="clientId" defaultValue={project?.clientId} required>
            <SelectTrigger id="clientId"><SelectValue placeholder="Select a client" /></SelectTrigger>
            <SelectContent>
              {clients?.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        {!isManager && (
          <div className="space-y-2">
            <Label htmlFor="managerId">Manager ID</Label>
            <Input id="managerId" name="managerId" defaultValue={project?.managerId} placeholder="Enter manager user ID" required />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" name="startDate" type="date" defaultValue={project?.startDate} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="estimatedEndDate">Estimated End Date</Label>
            <Input id="estimatedEndDate" name="estimatedEndDate" type="date" defaultValue={project?.estimatedEndDate} required />
        </div>
      </div>

       <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select name="projectType" defaultValue={project?.projectType} required>
                <SelectTrigger id="projectType"><SelectValue placeholder="Select a type" /></SelectTrigger>
                <SelectContent>
                {Object.entries(PROJECT_TYPES).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

      <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select name="status" defaultValue={project?.status} required>
                <SelectTrigger id="status"><SelectValue placeholder="Select a status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Off Track">Off Track</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
            </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}</Button>
      </div>
    </form>
  );
}
