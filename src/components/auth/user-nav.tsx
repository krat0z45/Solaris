
"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import { Button } from "@/components/ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon } from "lucide-react"
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

  export default function UserNav() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
      if (auth) {
        await signOut(auth);
        router.push('/login');
      }
    }

    if (isUserLoading) {
      return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
    }

    if (!user) {
        return (
            <Button asChild>
                <Link href="/login">Log In</Link>
            </Button>
        )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
              <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
