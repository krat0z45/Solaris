"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import MilestoneForm from "./milestone-form";
import type { Milestone } from "@/lib/types";
import { PlusCircle, Edit } from "lucide-react";
import { useUser } from "@/firebase";

type MilestoneActionsProps = {
  milestone?: Milestone;
};

export default function MilestoneActions({ milestone }: MilestoneActionsProps) {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const handleSuccess = () => {
    setOpen(false);
  };
  
  if (!user) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {milestone ? (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{milestone ? "Edit Milestone" : "Add New Milestone"}</SheetTitle>
          <SheetDescription>
            {milestone
              ? "Update the details for this milestone."
              : "Enter the details for the new milestone."}
          </SheetDescription>
        </SheetHeader>
        <MilestoneForm
            milestone={milestone}
            onSuccess={handleSuccess}
        />
      </SheetContent>
    </Sheet>
  );
}
