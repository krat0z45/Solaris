
"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required."),
  email: z.string().email("Invalid email address."),
});

export default function ClientForm({ onSuccess }: { onSuccess?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const validatedFields = clientSchema.safeParse(data);

    if (!validatedFields.success) {
      const errorMessage = Object.values(validatedFields.error.flatten().fieldErrors).flat().join("\n");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage || "Please check the form fields.",
      });
      return;
    }

    const clientData = {
      ...validatedFields.data,
      avatarUrl: `https://i.pravatar.cc/150?u=${Math.random().toString()}`
    };

    const clientsColRef = collection(firestore, 'clients');
    
    addDoc(clientsColRef, clientData)
      .then(() => {
        toast({
          title: "Success",
          description: "Client saved successfully.",
        });
        formRef.current?.reset();
        onSuccess?.();
      })
      .catch((e: any) => {
        if (e.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: 'clients',
                operation: 'create',
                requestResourceData: clientData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || "An unexpected error occurred while saving the client.",
            });
        }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 py-6">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Input id="name" name="name" placeholder="e.g. Innovate Corp" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Contact Email</Label>
        <Input id="email" name="email" type="email" placeholder="e.g. contact@innovate.com" required />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save Client</Button>
      </div>
    </form>
  );
}
