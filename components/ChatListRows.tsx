"use client";

// import {
//   ChatMembers,
//   chatMembersCollectionGroupRef,
// } from "@/lib/converters/ChatMembers";
// import { useSession } from "next-auth/react";
// import { useCollectionData } from "react-firebase-hooks/firestore";
import { MessageSquare } from "lucide-react";
import CreateChatButton from "./CreateChatButton";
import ChatListRow from "./ChatListRow";
import { useEffect } from "react";

// function ChatListRows({ initialChats }: { initialChats: ChatMembers[] }) {
function ChatListRows({ initialChats }: { initialChats: any[] }) {
  // const { data: session } = useSession();
  let session: any = null;

  // const [members, loading, error] = useCollectionData<ChatMembers>(
  //   session && chatMembersCollectionGroupRef(session?.user.id!),
  //   {
  //     initialValue: initialChats,
  //   }
  // );

  const members: any = [
    {
      chatId: "1111111"
    }
  ]

  const loading: any = false;
  const error: any = false;

 
  if (members?.length === 0)
    return (
      <div className="flex flex-col items-center justify-center pt-40 space-y-2">
        <MessageSquare className="h-10 w-10" />
        <h1 className="text-5xl font-extralight">Welcome!</h1>
        <h2 className="pb-10">
          {`Let's get you started by creating your first chat!`}
        </h2>
        <CreateChatButton isLarge />
      </div>
    );

  return (
    <div className="">
      {members?.map((member: any, i: any) => {
        return <ChatListRow key={member.chatId} chatId={member.chatId} />;
      })}
    </div>
  );
}

export default ChatListRows;
