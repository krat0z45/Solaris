
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Sun,
  LogOut,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";


const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/milestones", label: "Milestones", icon: CheckSquare },
];

const adminMenuItems = [
    { href: "/users", label: "Users", icon: Users, role: "admin" },
];

export default function AppSidebar() {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
      if(auth) {
        await signOut(auth);
        router.push('/login');
      }
    }


  return (
    <Sidebar>
      <SidebarHeader className="p-4 justify-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-primary bg-primary/10">
            <Sun />
          </Button>
          <span className="text-xl font-semibold group-data-[state=collapsed]:hidden">
            Solaris
          </span>
        </Link>
      </SidebarHeader>

      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2">
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            {user?.role === 'admin' && adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </div>

      <SidebarFooter className="p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                    <Link href="/settings">
                        <Settings />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                        <LogOut />
                        <span>Log Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
