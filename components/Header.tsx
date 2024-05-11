'use client'

import DarkModeToggle from "./DarkModeToggle";
import Logo from "./Logo";
import UserButton from "./UserButton";
import Link from "next/link";
import { MessagesSquareIcon } from "lucide-react";
import CreateChatButton from "./CreateChatButton";
import LanguageSelect from "./LanguageSelect";
import useSession from "@/lib/supabase/use-session";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";



function Header() {

  const session = useSession();

  const [isSigninPage, setIsSigninPage] = useState(false);
  const pathname = usePathname()


  useEffect(()=>{

    if(pathname) {
      console.log(pathname)
      if(pathname === '/signin') {
        setIsSigninPage(true);
      }
      else {
        setIsSigninPage(false);
      }
    }

  }, [pathname])

  

  if (!pathname || isSigninPage) {
    return null;
  }



  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black">
      <nav className="flex flex-col sm:flex-row items-center p-5 pl-2 bg-white dark:bg-black max-w-7xl mx-auto">
        <Logo />
        <div className="flex-1 flex items-center justify-end space-x-4">
          <LanguageSelect />
          {session ? (
            <>
              <Link href={"/chat"} prefetch={false}>
                <MessagesSquareIcon className="text-black dark:text-white" />
              </Link>
              <CreateChatButton />
            </>
          ) : (
            null
          )}
          
          <DarkModeToggle />

          <UserButton session={session} />
        </div>
      </nav>

    </header>
  );
}

export default Header;
