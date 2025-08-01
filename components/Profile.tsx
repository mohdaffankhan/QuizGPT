"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signIn, signOut, useSession } from "next-auth/react";
import { Grip } from "lucide-react";
import Link from "next/link";

export default function Profile() {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:border-none focus:outline-none">
        {session?.user ? (
          <Avatar className="max-sm:w-6 max-sm:h-6">
            <AvatarImage src={session.user.image || "https://github.com/shadcn.png"} alt="profile" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        ) : (
          <Grip className="w-5 h-5 hover:scale-110 transition-all duration-300" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-fit" align="end">
        {session?.user && (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session.user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {session?.user ? (
          <>
            <Link href="/my-quizes">
              <DropdownMenuItem>My Quizes</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => signIn("google")}>
            Sign in
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
