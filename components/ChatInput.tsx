"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

import { useRouter } from "next/navigation";
import { Subscript } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useEffect, useState } from "react";
import useSession from "@/lib/supabase/use-session";

const formSchema = z.object({
  input: z.string().max(1000),
});

function ChatInput({ chatId }: { chatId: string }) {

  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();
  const [userAccount, setUserAccount] = useState<{
    fullname: string,
    email: string,
    user_id: string,
    avatar: string,
  } | null>(null);


  const session = useSession();
  const router = useRouter();


  async function fetchUserAccount(session: any) {
    let user = session?.user;
    const { data, error } = await supabase.from('users').select('*').eq('email', user.email).single();

    if (data && !error) {
      setUserAccount(data);
    }
  }

  useEffect(() => {
    if (session) {
      fetchUserAccount(session);
    }
  }
    , [session]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {

    if (!userAccount) {
      toast({
        title: "Error",
        description: "User account not found",
        className: "bg-red-300 text-white",
      });
      router.push("/");
      return;
    }

    // try to find the chat group from chat_groups table
    const { data: chatGroup, error: chatGroupError } = await supabase.from('chat_groups').select('*').eq('id', chatId).single();

    if (chatGroupError || !chatGroup) {
      toast({
        title: "Error",
        description: "Chat group not found",
        className: "bg-red-300 text-white",
      });
      router.push("/chat");
    }

    // update last_text, last_text_sent_by, last_text_sent_by_details, last_text_sent_at in chat_groups table
    let last_text = values.input;
    let last_text_sent_by = userAccount.user_id;
    let last_text_sent_by_details = userAccount;
    let last_text_sent_at = Date.now();

    const { data, error } = await supabase.from('chat_groups').update({ last_text, last_text_sent_by, last_text_sent_by_details, last_text_sent_at }).eq('id', chatId);



    // Send message to chat table
    const message = {
      group_id: chatId,
      type: "text",
      sent_by: userAccount.user_id,
      sent_by_details: userAccount,
      text: values.input,
      attachment: null
    };

    const { data: chatMessage, error: chatMessageError } = await supabase.from('chat').insert(message);

    form.reset();

  }

  return (
    <div className="fixed bottom-[10px] left-0 w-full bg-black">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex space-x-2 p-2 rounded-t-xl max-w-xl mx-auto bg-white border dark:bg-black"
        >
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    className="border-none bg-transparent dark:placeholder:text-wite/70"
                    placeholder="Enter message in ANY language..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="bg-violet-600 text-white">
            Send
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ChatInput;
