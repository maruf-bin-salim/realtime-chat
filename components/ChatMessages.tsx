"use client";

import { useLanguageStore } from "@/store/store";
import { DownloadIcon, MessageCircleIcon } from "lucide-react";
import { createRef, use, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import UserAvatar from "./UserAvatar";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";



function ChatMessages({
  chatId,
  session,
  userAccount,
  initialMessages,
}: {
  chatId: string;
  session: any | null;
  userAccount: { user_id: string; email: string, fullname: string, avatar: string } | null;
  initialMessages: any[];
}) {

  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const messagesEndRef = createRef<HTMLDivElement>();
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const loading: any = false;
  const error: any = false;
  const [messages, setMessages] = useState<any[]>([]);

  const store = useLanguageStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  function getText(chat: any){


    let translations = chat?.translations;
    let currentLanguage = store.language;

    for (let i = 0; i < translations.length; i++) {
      if (translations[i].language === currentLanguage) {
        return translations[i].text;
      }
    }

    return chat.text;

  }

  async function checkIfGroupExists() {
    const { data, error } = await supabase
      .from('chat_groups')
      .select('*')
      .eq('id', chatId)
      .single();

    if (!data || error) {

      toast({
        title: "Error",
        description: "Chat group not found",
        className: "bg-red-600 text-white",
      });
      router.push('/chat');
    }
  }

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .eq('group_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        className: "bg-red-600 text-white",
      });
      return;
    }

    console.log('data', data);
    setMessages(data);

  }

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {

    if (!chatId) return;

    const subscription = supabase
      .channel('chat_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat' }, payload => {
        console.log('chat message change', payload);
        if (payload.new.group_id === chatId) {
          setMessages([...messages, payload.new]);
        }
      })
      .subscribe()

    const groupSubscription = supabase
      .channel('chat_groups_subscription')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_groups' }, payload => {
        checkIfGroupExists();
      })
      .subscribe()


    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(groupSubscription);
    };

  }
    , [chatId, messages]);


  return (
    <div className="p-5 flex-[1]">
      {!loading && messages?.length === 0 && (
        <div
          className="flex flex-col justify-center items-center p-20
        rounded-xl space-y-2 dark:border text-center dark:text-white font-light"
        >
          <MessageCircleIcon className="w-10 h-10" />

          <h2>
            <span className="font-bold">Invite a friend</span>{' '}
            <span className="font-bold">
              Send your first message in ANY language
            </span>{" "}
            below to get started!
          </h2>
          <p>We will auto-detect & translate it all for you!</p>
        </div>
      )}

      {messages?.map((message: any, index) => {
        const isSender = message.sent_by === userAccount?.user_id;
        return (
          <div key={index} className="flex my-2 md:my-4 items-end">
            <div
              className={`flex flex-col w-96 relative space-y-2 p-4 overflow-auto whitespace-normal mx-2 rounded-lg ${isSender
                ? "ml-auto bg-gray-800 text-white rounded-br-none"
                : "bg-gray-300 dark:bg-slate-700 dark:text-gray-100 rounded-bl-none"
                }`}
            >
              <p
                className={`text-white text-lg font-bold ${isSender ? "text-right" : "text-left text-gray-800 dark:text-gray-100"
                  }`}
              >
                {message?.sent_by_details?.fullname.split(" ")[0] || message?.sent_by_details?.email || "User"}{" "}
              </p>

              <div className={isSender ? "flex flex-col gap-2 p-2 rounded-md bg-gray-600" : "flex flex-col gap-2 bg-gray-800 p-2 rounded-md"}>
                <p className={message.attachment ? "font-bold whitespace-normal break-words" : "font-bold whitespace-normal break-words"}>
                  {getText(message)}
                </p>
                <p className={isSender ? "text-gray-400 text-sm" : "text-black dark:text-white text-sm"}>
                  {new Date(message.created_at).toLocaleString()}</p>
              </div>

              {
                message.attachment && (
                  <div className={isSender ? "flex items-center justify-between p-2 rounded-md text-black bg-gray-600" : "flex items-center justify-between p-2 rounded-md bg-gray-800"}>
                    <div>
                      {
                        (message.attachment.includes('.png') || message.attachment.includes('.jpg') || message.attachment.includes('.jpeg') || message.attachment.includes('.gif')) &&
                        <img src={message.attachment} alt="attachment" className="w-20 h-20 object-cover rounded-lg mb-2" />
                      }
                      <p className={isSender ? "text-[#cbcbcb] underline" : "text-gray-400 underline"}>
                        {`file.` + message.attachment.split('/').pop().split('.')[2]}
                      </p>
                    </div>
                    <button onClick={() => window.open(message.attachment, '_blank')}
                      className={isSender ? "mt-auto flex items-center gap-2 p-2 bg-transparent text-white rounded-lg" : "mt-auto flex items-center gap-2 p-2 bg-transparent text-white"}>
                      <DownloadIcon size={24} className="" />
                    </button>

                  </div>
                )
              }


            </div>
            <UserAvatar
              name={message?.sent_by_details?.fullname || message?.sent_by_details?.email || "User"}
              image={message?.sent_by_details?.avatar || "/avatar.png"}
              className={`${!isSender && "-order-1"}`}
            />
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessages;
