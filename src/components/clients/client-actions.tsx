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
import ClientForm from "./client-form";
import { PlusCircle } from "lucide-react";

export default function ClientActions() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add New Client</SheetTitle>
          <SheetDescription>
            Enter the details for the new client.
          </SheetDescription>
        </SheetHeader>
        <ClientForm onSuccess={handleSuccess} />
      </SheetContent>
    </Sheet>
  );
}
