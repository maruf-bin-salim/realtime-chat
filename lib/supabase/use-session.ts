"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "./browser-client";
import { Session } from "@supabase/supabase-js";

export default function useSession() {
  const supabase = createSupabaseBrowserClient();

  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {

    let data = supabase.auth.onAuthStateChange((event, session)=>{
      setSession(session);
    });

    return () => data?.data?.subscription?.unsubscribe();

  }, []);

  return session;
}
