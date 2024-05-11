import ChatList from "@/components/ChatList";
import ChatPermissionsError from "@/components/ChatPermissionsError";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

type Props = {
  params: {};
  searchParams: {
    error: string;
  };
};

async function ChatsPage({ searchParams: { error } }: Props) {


  const { data: { session },
    error: sessionError,
  } = await createSupabaseServerComponentClient().auth.getSession();

  const user = session?.user;

  if ((sessionError || !user)) {
    redirect("/");
  }


  return (
    <div className="flex-1 w-full flex flex-col max-w-6xl mx-auto">
      <ChatList />

    </div>
  );
}

export default ChatsPage;
