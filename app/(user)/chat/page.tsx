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

  console.log(user);

  return (
    <div className="">
      {error && (
        <div className="m-2">
          <ChatPermissionsError />
        </div>
      )}
      <ChatList />
    </div>
  );
}

export default ChatsPage;
