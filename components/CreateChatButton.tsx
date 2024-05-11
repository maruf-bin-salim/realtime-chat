"use client";

import { MessageSquarePlus } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import LoadingSpinner from "./LoadingSpinner";

import { ToastAction } from "@radix-ui/react-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import useSession from "@/lib/supabase/use-session";

function CreateChatButton({ isLarge }: { isLarge?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const session = useSession();

  const [userAccount, setUserAccount] = useState<{
    fullname: string,
    email: string,
    user_id: string,
    avatar: string,
  } | null>(null);

  async function fetchUserAccount(session: any) {
    let user = session?.user;


    const { data, error } = await supabase.from('users').select('*').eq('email', session.user.email).single();

    if(!data || error || data.length === 0) {

      let userAccountData = {
        email: user?.email,
        avatar: user?.user_metadata?.avatar_url || null,
        fullname: user?.user_metadata?.full_name || user?.user_metadata?.name
      }
      let {data: userData, error: userError} = await supabase.from('users').upsert(userAccountData).select('*').single();
      if(userData) {
        setUserAccount(userData);
      }
    }
    else {
      setUserAccount(data);
    }

  }
  useEffect(() => {


    if (session) {
      fetchUserAccount(session);

    }
  }, [session]);


  const createNewChat = async () => {
    if (!session?.user.id || !userAccount) {
      toast({
        title: "Error!",
        description: "You must be signed in to create a new chat!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Creating a new chat...",
      description: "Hold tight while we create a new chat for you...",
      className: "bg-yellow-300 text-black",
      duration: 3000,
    });

    const chatGroup = {
      admin_id: userAccount.user_id,
      last_text: 'New Chat',
      last_text_sent_at: Date.now(),
      last_text_sent_by: userAccount.user_id,
      last_text_sent_by_details: {
        user_id: userAccount.user_id,
        fullname: userAccount.fullname,
        email: userAccount.email,
        avatar: userAccount.avatar,
      },
      users_with_permission: [userAccount.user_id],
    }

    const { data, error } = await supabase.from('chat_groups').insert(chatGroup).select('*').single();

    if (error) {
      console.error(error);
      toast({
        title: "Error!",
        description: "There was an error creating your chat!",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }


    toast({
      title: "Success!",
      description: "You have successfully created a new chat!",
      className: "bg-green-600 text-white",
      duration: 2000,
    });

    setLoading(false);
  };



  if (isLarge)
    return (
      <div>
        <Button variant={"default"} onClick={createNewChat}>
          {loading ? <LoadingSpinner /> : "Create a New Chat"}
        </Button>
      </div>
    );

  return (
    <Button onClick={createNewChat} variant={"ghost"}>
      <MessageSquarePlus />
    </Button>
  );
}

export default CreateChatButton;
