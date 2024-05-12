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
import { ArrowDownNarrowWide, ArrowUp, ImageIcon, Subscript, UploadIcon, XIcon } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useEffect, useRef, useState } from "react";
import useSession from "@/lib/supabase/use-session";
import LoadingSpinner from "./LoadingSpinner";

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

  const ref = useRef();

  const resetFileInput = () => {
    if (!ref.current) {
      return;
    }
    ref.current.value = "";
  }

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);

  const handleImageChange = (event: any) => {


    if (event.target.files && event.target.files[0]) {

      setImage(event.target.files[0]);
    }
  };

  const handleUpload = async () => {

    if (!image) {
      return;
    }

    setUploading(true);
    // ... file selection and validation ...
    const file = image;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    resetFileInput();

    const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file);
    if (uploadError) {
      throw uploadError;
    }
    await onUpload(filePath);
    setUploading(false);
  };

  async function onUpload(filePath: string) {
    const { data, error } = await supabase.storage
      .from('attachments').getPublicUrl(filePath);

    if (data) {
      console.log(data.publicUrl);
    }

    setFileUpload(false);
    resetFileInput();
  };



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
      {/* 
      <div>
        <input type='file' />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div> */}

      <Form {...form}>
        <div className="flex items-center justify-between p-2 bg-white bg-white dark:bg-black gap-2">

          {

            fileUpload && !uploading &&
            <div className="flex items-center gap-2 max-w-xl mx-auto">

              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input"></label>
              <input ref={ref} onChange={handleImageChange} className="block w-full text-sm text-gray-900 rounded-lg cursor-pointer bg-gray-100 p-2 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"></input>
              <button onClick={() => { resetFileInput(); setImage(null); setFileUpload(false) }}>
                <XIcon size={24} className="text-black dark:text-white" />
              </button>
              <button onClick={handleUpload} disabled={uploading} className="text-white">
                <UploadIcon size={24} className="text-black dark:text-white" />
              </button>
            </div>
          }

          {
            fileUpload && uploading &&
            <div className="flex items-center gap-2 max-w-xl mx-auto">
              <LoadingSpinner />
            </div>
          }


        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex space-x-2 p-2 rounded-t-xl max-w-xl mx-auto bg-white border dark:bg-black items-center"
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
          <div
            className=" dark:bg-black text-black dark:text-white h-full flex items-center justify-center rounded-lg cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              form.reset();
            }}>
            {
              !fileUpload ? <ImageIcon size={40} className="text-black dark:text-white" onClick={() => setFileUpload(true)} />
                : (null)
            }
          </div>
          <Button type="submit" className="bg-violet-600 text-white" disabled={fileUpload}>
            Send
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ChatInput;
