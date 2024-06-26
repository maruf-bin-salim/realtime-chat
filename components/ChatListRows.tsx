"use client";

import { MessageSquare } from "lucide-react";
import CreateChatButton from "./CreateChatButton";
import ChatListRow from "./ChatListRow";
import { useEffect, useState } from "react";
import useSession from "@/lib/supabase/use-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Skeleton } from "./ui/skeleton";

function ChatListRows({ initialChats }: { initialChats: any[] }) {


  const session = useSession();
  const supabase = createSupabaseBrowserClient();
  const [userAccount, setUserAccount] = useState<{
    fullname: string,
    email: string,
    user_id: string,
    avatar: string,
  } | null>(null);
  const [chatGroups, setChatGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  async function getAllUserChatGroups(user_id: String) {
    const { data, error } = await supabase.from('chat_groups').select('*');



    if (error) {
      setLoading(false);
      console.log(error);
      return;
    }



    let chatGroups = [];

    for (let i = 0; i < data.length; i++) {
      const chatGroup = data[i];
      const members_of_chat_group = data[i].users_with_permission || [];


      if (members_of_chat_group.includes(user_id)) {
        chatGroups.push(chatGroup);
      }
    }

    // sort by last_message_sent_at

    chatGroups.sort((a, b) => {
      let x = b.last_text_sent_at - a.last_text_sent_at;
      return x;
    });

    setChatGroups(chatGroups);
    setLoading(false);


  }

  useEffect(() => {
    if (session && userAccount) {

      getAllUserChatGroups(userAccount.user_id);

    }
  }, [userAccount, session]);

  useEffect(() => {
    async function setUserAccountData(session: any) {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*').eq('email', session.user.email).single();
      setUserAccount(data);
    }
    if (session) {
      // update user account
      setUserAccountData(session);
    }
  }
    , [session]);

  useEffect(() => {

    if (!userAccount) return;

    const subscription = supabase
      .channel('chat_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_groups' }, payload => {
        setLoading(true);
        getAllUserChatGroups(userAccount.user_id);
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription);
    };

  }
    , [userAccount]);


  if (loading) return (
    <div className="flex p-5 items-center space-x-2">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )

  if (chatGroups?.length === 0) return (
    <div className="flex flex-col items-center justify-center pt-40 space-y-2">
      <MessageSquare className="h-10 w-10" />
      <h1 className="text-5xl font-extralight">Welcome!</h1>
      <h2 className="pb-10">
        {`Let's get you started by creating your first chat!`}
      </h2>
      <CreateChatButton isLarge />
    </div>
  )

  return (
    <div className="">
      {chatGroups?.map((member: any, i: any) => {
        return <ChatListRow key={member.id} chatId={member.id} chatGroup={member} />;
      })}
    </div>
  );
}

export default ChatListRows;
