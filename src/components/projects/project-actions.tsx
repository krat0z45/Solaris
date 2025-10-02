
"use client";

import React, { useState } from "react";
import type { Project } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import ProjectForm from "./project-form";
import { PlusCircle, Edit } from "lucide-react";
import { useUser } from "@/firebase";

type ProjectActionsProps = {
  project?: Project;
};

export default function ProjectActions({ project }: ProjectActionsProps) {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {project ? (
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Project
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{project ? "Edit Project" : "Add New Project"}</SheetTitle>
          <SheetDescription>
            {project
              ? "Update the details for this project."
              : "Enter the details for the new project."}
          </SheetDescription>
        </SheetHeader>
        {/* Pass the user's role to the form */}
        <ProjectForm
            project={project}
            userRole={user?.role}
            onSuccess={handleSuccess}
        />
      </SheetContent>
    </Sheet>
  );
}
