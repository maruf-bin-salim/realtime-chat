'use client'

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function SignUp() {
    const supabase = createSupabaseBrowserClient();

    const handleLogin = async () => {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback?next=${
            ""
          }`,
        },
      });
    };
  
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleLogin}>
                Sign in with Google
            </button>
        </div>
    )
}
