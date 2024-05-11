// import { authOptions } from "@/auth";
import AdminControls from "@/components/AdminControls";
import ChatInput from "@/components/ChatInput";
import ChatMembersBadges from "@/components/ChatMembersBadges";
import ChatMessages from "@/components/ChatMessages";
import ChatPermissionsError from "@/components/ChatPermissionsError";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
// import { chatMembersRef } from "@/lib/converters/ChatMembers";
// import { sortedMessagesRef } from "@/lib/converters/Message";
// import { getDocs } from "firebase/firestore";
// import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type Props = {
  params: {
    chatId: string;
  };
};

async function ChatPage({ params: { chatId } }: Props) {
  // const session = await getServerSession(authOptions);
  const supabase = createSupabaseServerClient();
  const { data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if ((sessionError || !session?.user)) {
    redirect("/");
  }

  let email = session?.user.email;

  let { data: userAccount, error } = await supabase.from('users').select('*').eq('email', email).single();

  let { data: chatGroup, error: chatGroupError } = await supabase.from('chat_groups').select('*').eq('id', chatId).single();

  let users_with_permission = chatGroup?.users_with_permission || [];

  let hasAccess = users_with_permission.includes(userAccount?.user_id);


  // fetch all users from users table whos id is in users_with_permission array


  // const { data, error } = await supabase
  // .from('countries')
  // .select()
  // .in('name', ['Albania', 'Algeria'])

  const { data: chatMembers, error: chatMembersError } = await supabase.from('users').select('*').in('user_id', users_with_permission);
  console.log('chatMembers', chatMembers);

  let admin_id = chatGroup?.admin_id;

  let memberBadges = chatMembers?.map((member: any) => {
    let isAdmin = member.user_id === admin_id;
    return {
      ...member,
      isAdmin
    }
  }) || [];


  const initialMessages: any[] = [];



  return (
    <div className="flex-1 w-full flex flex-col max-w-6xl mx-auto h-screen pb-2">

      {
        !hasAccess && (
          <div className="p-2">
            <ChatPermissionsError />
          </div>
        )
      }
      {
        hasAccess && (
          <>
            <AdminControls chatId={chatId} />
            <ChatMembersBadges chatId={chatId} memberBadges={memberBadges} />

            <div className="flex-1">
              <ChatMessages
                chatId={chatId}
                session={session}
                initialMessages={initialMessages}
              />
            </div>

            <ChatInput chatId={chatId} />
          </>
        )
      }



    </div>

  );
}

export default ChatPage;
