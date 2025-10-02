"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { z } from "zod";
import type { Milestone } from "@/lib/types";
import { PROJECT_TYPES } from "@/lib/constants";

const milestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required."),
  description: z.string().min(1, "Description is required."),
  projectType: z.string().min(1, "Project type is required."),
});

type MilestoneFormProps = {
    milestone?: Milestone;
    onSuccess?: () => void;
};

export default function MilestoneForm({ milestone, onSuccess }: MilestoneFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const validatedFields = milestoneSchema.safeParse(data);

    if (!validatedFields.success) {
      const errorMessage = Object.values(validatedFields.error.flatten().fieldErrors).flat().join("\n");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage || "Please check the form fields.",
      });
      return;
    }

    const milestoneData = validatedFields.data;
    
    const handleSuccess = () => {
      toast({
        title: "Success",
        description: `Milestone ${milestone ? 'updated' : 'created'} successfully.`,
      });
      formRef.current?.reset();
      onSuccess?.();
    };
    
    const handleError = (e: any, operation: 'create' | 'update') => {
      if (e.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
              path: milestone ? `milestones/${milestone.id}` : 'milestones',
              operation,
              requestResourceData: milestoneData,
          });
          errorEmitter.emit('permission-error', permissionError);
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: e.message || "An unexpected error occurred while saving the milestone.",
        });
      }
    };

    if (milestone) {
        const milestoneRef = doc(firestore, 'milestones', milestone.id);
        updateDoc(milestoneRef, milestoneData)
          .then(handleSuccess)
          .catch((e) => handleError(e, 'update'));
    } else {
        const milestonesColRef = collection(firestore, 'milestones');
        addDoc(milestonesColRef, milestoneData)
          .then(handleSuccess)
          .catch((e) => handleError(e, 'create'));
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 py-6">
      <div className="space-y-2">
        <Label htmlFor="name">Milestone Name</Label>
        <Input id="name" name="name" defaultValue={milestone?.name} placeholder="e.g. Site Survey" required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={milestone?.description} placeholder="Describe what this milestone entails." required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="projectType">Project Type</Label>
        <Select name="projectType" defaultValue={milestone?.projectType} required>
            <SelectTrigger id="projectType"><SelectValue placeholder="Select a type" /></SelectTrigger>
            <SelectContent>
            {Object.entries(PROJECT_TYPES).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{milestone ? 'Save Changes' : 'Create Milestone'}</Button>
      </div>
    </form>
  );
}
