"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function BreadcrumbPath() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    if (segments.length === 0) {
      return null;
    }

    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((segment, index) => {
                    // Don't show the 'dashboard' segment again
                    if (segment.toLowerCase() === 'dashboard' && index === 0) return null;

                    const path = `/${segments.slice(0, index + 1).join('/')}`;
                    const isLast = index === segments.length - 1;

                    return (
                        <React.Fragment key={path}>
                           <BreadcrumbSeparator />
                            <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={path}>{capitalize(segment)}</Link>
                                </BreadcrumbLink>
                            )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
      </Breadcrumb>
    )
}

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      
      <BreadcrumbPath />

      <div className="ml-auto flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}
