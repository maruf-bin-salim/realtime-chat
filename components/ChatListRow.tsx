"use client";
import { Skeleton } from "./ui/skeleton";
import UserAvatar from "./UserAvatar";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/store";

function ChatListRow({ chatId, chatGroup }: { chatId: string, chatGroup: any }) {


  const groups: any = [
    {
      user: {
        name: chatGroup?.name || "John Doe1",
        image: "/avatar.png",
      },
      translated: {
        en: "Hello, how are you?",
      },
      timestamp: new Date(),
    },
  ];
  const error: any = false;

  const language = useLanguageStore((state) => state.language);
  let session: any = null;
  const router = useRouter();

  function prettyUUID(n = 4) {
    return chatId.substring(0, n);
  }

  function trunchateName(name: string) {

    // keep 2 words or 15 characters, whichever is less
    const words = name.split(" ");
    if (words.length > 1) {
      return words[0] + " " + words[1];
    }
    return name.substring(0, 15);

  }


  return (
    <div
      key={chatId}
      onClick={() => router.push(`/chat/${chatGroup?.id}`)}
      className="flex p-5 items-center space-x-2 cursor-pointer hover:bg-gray-100 hover:rounded-2xl dark:hover:bg-slate-700 dark:hover:bg-opacity-20 "
    >
      <UserAvatar
        name={chatGroup?.last_text_sent_by_details.fullname || 'User'}
        image={chatGroup?.last_text_sent_by_details.avatar || "/images/avatar.jpg"}
      />

      <div className="flex-1">
        <p className="font-bold">
          {chatGroup.last_text === "New Chat" && "New Chat "}
          <span className="text-gray-400">
            {chatGroup && trunchateName(chatGroup.last_text_sent_by_details.fullname) || "User"}
          </span>
        </p>
        <p className="text-gray-400 line-clamp-1 w-40 md:w-96">
          {
            chatGroup?.last_text === "New Chat"
              ? "Get the conversation started!"
              : chatGroup?.last_text
          }
        </p>
      </div>

      <div className="text-xs text-gray-400 text-right">
        <p className="mb-auto">
          {chatGroup
            ? new Date(chatGroup.last_text_sent_at).toLocaleDateString()
            : "No groups yet"}
        </p>
        <p className="">chat #{prettyUUID()}</p>
      </div>
    </div>
  );
}

export default ChatListRow;
