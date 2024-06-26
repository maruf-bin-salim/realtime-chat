import AdminControls from "@/components/AdminControls";
import ChatInput from "@/components/ChatInput";
import ChatMembersBadges from "@/components/ChatMembersBadges";
import ChatMessages from "@/components/ChatMessages";
import ChatPermissionsError from "@/components/ChatPermissionsError";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

type Props = {
  params: {
    chatId: string;
  };
};

async function ChatPage({ params: { chatId } }: Props) {
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




  const { data: chatMembers, error: chatMembersError } = await supabase.from('users').select('*').in('user_id', users_with_permission);

  let admin_id = chatGroup?.admin_id;

  let memberBadges = chatMembers?.map((member: any) => {
    let isAdmin = member.user_id === admin_id;
    return {
      ...member,
      isAdmin
    }
  }) || [];

  const isCurrentUserAdmin = admin_id === userAccount?.user_id;


  const initialMessages: any[] = [];



  return (
    <div className="flex-1 w-full flex flex-col max-w-6xl mx-auto pb-2 h-screen">

      {
        !hasAccess && (
          <div className="p-2">
            <ChatPermissionsError />
          </div>
        )
      }
      {
        hasAccess && (
          <div className="w-full flex flex-col max-w-6xl mx-auto h-[80vh]">
            <AdminControls chatId={chatId} isAdmin={isCurrentUserAdmin} />
            <ChatMembersBadges memberBadges={memberBadges} />

            <div className="flex-1 pb-2 overflow-y-scroll mb-[50px] md:mb-[0px]">
              <ChatMessages
                chatId={chatId}
                session={session}
                userAccount={userAccount}
                initialMessages={initialMessages}
              />
            </div>
            <ChatInput chatId={chatId} />
          </div>
        )
      }



    </div>

  );
}

export default ChatPage;
