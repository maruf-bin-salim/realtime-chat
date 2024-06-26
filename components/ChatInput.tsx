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
import { useLanguageStore } from "@/store/store";



function getGoogleLanguageCode(languageName: string): string {


  const languageMap = {
    "en": "en",
    "pl": "pl",
    "de": "de",
    "fr": "fr",
    "es": "es",
    "tr": "tr",
    "hi": "hi",
    "ja": "ja",
    "la": "la",
    "ru": "ru",
    "zh": "zh-CN",
    "vi": "vi"
  } as const;


  const lowercaseLanguageName = languageName.toLowerCase() as keyof typeof languageMap;

  return languageMap[lowercaseLanguageName];
}


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
  const store = useLanguageStore();

  const ref = useRef<HTMLInputElement>(null);

  const resetFileInput = () => {
    if (!ref.current) {
      return;
    }

    const inputElement = ref.current as HTMLInputElement | null;
    if (inputElement) {
      inputElement.value = "";
    }
  }


  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [sending, setSending] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const file: File = image;
    const fileExt: string | undefined = file.name.split('.').pop();
    if (!fileExt) {
      // Handle error: unable to get file extension
      return;
    }

    const fileName: string = `${Math.random()}.${fileExt}`;
    const filePath: string = `${fileName}`;

    resetFileInput();

    const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file);
    if (uploadError) {
      throw uploadError;
    }
    await onUpload(filePath);
    setUploading(false);
  };

  async function onUpload(filePath: string) {
    const { data } = supabase.storage
      .from('attachments').getPublicUrl(filePath);

    if (data) {
      console.log(data.publicUrl);
      sendAttachmentChat(data.publicUrl);
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

  async function sendAttachmentChat(url: string | null) {

    if (!url) {
      return;
    }

    if (!userAccount) {
      toast({
        title: "Error",
        description: "User account not found",
        className: "bg-red-300 text-white",
      });
      router.push("/");
      return;
    }

    const { data: chatGroup, error: chatGroupError } = await supabase.from('chat_groups').select('*').eq('id', chatId).single();

    if (chatGroupError || !chatGroup) {
      toast({
        title: "Error",
        description: "Chat group not found",
        className: "bg-red-300 text-white",
      });
      router.push("/chat");
    }

    let last_text = "A file attachment has been sent";
    let last_text_sent_by = userAccount.user_id;
    let last_text_sent_by_details = userAccount;
    let last_text_sent_at = Date.now();

    const { data, error } = await supabase.from('chat_groups').update({ last_text, last_text_sent_by, last_text_sent_by_details, last_text_sent_at }).eq('id', chatId);


    const message = {
      group_id: chatId,
      type: "attachment",
      sent_by: userAccount.user_id,
      sent_by_details: userAccount,
      text: 'An attachment has been sent',
      attachment: url
    };


    const { data: chatMessage, error: chatMessageError } = await supabase.from('chat').insert(message);




  }

  async function onSubmit(values: z.infer<typeof formSchema>) {


    let text = values.input;
    form.reset();



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
    let last_text = text;
    let last_text_sent_by = userAccount.user_id;
    let last_text_sent_by_details = userAccount;
    let last_text_sent_at = Date.now();

    setSending(true);

    const { data, error } = await supabase.from('chat_groups').update({ last_text, last_text_sent_by, last_text_sent_by_details, last_text_sent_at }).eq('id', chatId);



    // https://github.com/ssut/py-googletrans/issues/268
    let translationPromises = Promise.all(store.getLanguages().map(async (language) => {
      const tl = getGoogleLanguageCode(language);
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          tl: tl
        }),
      });

      const json = await response.json();

      let data = {
        language: language,
        text: json?.text?.[0]?.[0] || text
      };
      return data; // Return the result of each translation
    }));

    const translations = await translationPromises; // Wait for all translations to be done
    console.log(translations); // Log the translations





    // Send message to chat table
    const message = {
      group_id: chatId,
      type: "text",
      sent_by: userAccount.user_id,
      sent_by_details: userAccount,
      text: text,
      attachment: null,
      translations: translations
    };

    const { data: chatMessage, error: chatMessageError } = await supabase.from('chat').insert(message);

    setSending(false);

  }

  return (
    <div className="fixed bottom-[10px] left-0 w-full bg-black">


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

          <Button type="submit" className="bg-violet-600 text-white" disabled={fileUpload || sending}>
            {
              sending ? <LoadingSpinner /> : "Send"
            }
          </Button>
        </form>

      </Form>
    </div>
  );
}

export default ChatInput;
