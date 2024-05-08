"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
// import { Session } from "next-auth";
import { Button } from "./ui/button";
// import { signIn, signOut } from "next-auth/react";
// import { useSubscriptionStore } from "@/store/store";
import LoadingSpinner from "./LoadingSpinner";
import { StarIcon } from "lucide-react";
import ManageAccountButton from "./ManageAccountButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

function UserButton({ session }: { session: any | null }) {

  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const subscription = { role: "pro" }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Subscription listener
  if (!session)
    return (
      <Link href="/signin">
        <Button variant={"outline"} onClick={() => { }}>
          Sign In
        </Button>
      </Link>
    );
  return (
    session && (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar name={session.user?.email} image={session?.user_metadata?.avatar_url} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="dark:bg-black">
          <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {subscription === undefined && (
            <DropdownMenuItem>
              <LoadingSpinner />
            </DropdownMenuItem>
          )}

          {subscription?.role === "pro" && (
            <>
              <DropdownMenuLabel
                className="text-xs flex items-center justify-start
            space-x-1 text-[#00FFFF] animate-pulse"
              >
                <StarIcon fill="#00FFFF" />
                {/* <p>PRO</p> */}
                <p>User</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <ManageAccountButton />
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem onClick={handleLogout}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
}

export default UserButton;
