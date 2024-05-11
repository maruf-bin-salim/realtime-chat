"use client";

import { MessageSquarePlus } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
// import { useSubscriptionStore } from "@/store/store";
import LoadingSpinner from "./LoadingSpinner";

import { ToastAction } from "@radix-ui/react-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import useSession from "@/lib/supabase/use-session";

function CreateChatButton({ isLarge }: { isLarge?: boolean }) {
  // const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const session = useSession();

  const [userAccount, setUserAccount] = useState<{
    fullname: string,
    email: string,
    user_groups: string[],
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
    //  logic to create a new chat
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

    // update user_groups in user account
    const updatedUserGroups = [...userAccount.user_groups, data.id];

    const { error: updatedUserError } = await supabase.from('users').update({ user_groups: updatedUserGroups }).eq('user_id', userAccount.user_id);

    // get updated user account
    const { data: updatedUser, error: updatedUserError2 } = await supabase.from('users').select('*').eq('user_id', userAccount.user_id).single();
    setUserAccount(updatedUser);

    if (!error) {
      setUserAccount(updatedUser);
      console.log(updatedUserGroups);

      toast({
        title: "Success!",
        description: "You have successfully created a new chat!",
        className: "bg-green-600 text-white",
        duration: 2000,
      });
    }

    // else chat creation failed
    else {
      console.error(error);
      toast({
        title: "Error!",
        description: "There was an error creating your chat!",
        variant: "destructive",
      });
    }




    // // Check if user is pro and limit them creating a new chat.

    // const noOfChats = (
    //   await getDocs(chatMembersCollectionGroupRef(session.user.id))
    // ).docs.map((doc) => doc.data()).length;

    // const isPro =
    //   subscription?.role === "pro" && subscription.status === "active";

    // if (!isPro && noOfChats >= 3) {
    //   toast({
    //     title: "Free plan limit exceeded!",
    //     description:
    //       "You have exceeded the free plan limit. Please upgrade to the PRO plan to create more chats.",
    //     variant: "destructive",
    //     action: (
    //       <ToastAction
    //         altText="Upgrade"
    //         onClick={() => router.push("/register")}
    //         className="w-96 border border-white rounded-lg p-1"
    //       >
    //         Upgrade to PRO
    //       </ToastAction>
    //     ),
    //   });
    //   setLoading(false);

    //   return;
    // }

    // const chatId = uuidv4();

    // await setDoc(addChatRef(chatId, session.user.id), {
    //   userId: session.user.id!,
    //   email: session.user.email!,
    //   timestamp: serverTimestamp(),
    //   isAdmin: true,
    //   chatId: chatId,
    //   image: session.user.image || "",
    // })
    //   .then(() => {
    //     toast({
    //       title: "Success!",
    //       description: "You have successfully created a new chat!",
    //       className: "bg-green-600 text-white",
    //       duration: 2000,
    //     });
    //     router.push(`/chat/${chatId}`);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     toast({
    //       title: "Error!",
    //       description: "There was an error creating your chat!",
    //       variant: "destructive",
    //     });
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
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
