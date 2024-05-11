"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "./ui/use-toast";
// import { useSession } from "next-auth/react";
// import useAdminId from "@/hooks/useAdminId";
import { useRouter } from "next/navigation";
import useSession from "@/lib/supabase/use-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

function DeleteChatButton({ chatId }: { chatId: string }) {

  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const supabase = createSupabaseBrowserClient();

  const handleDelete = async () => {
    toast({
      title: "Deleting chat...",
      description: "Hold tight while we delete your chat...",
      className: "bg-yellow-300 text-white",
    });

    console.log("Deleting: ", chatId);

    // get the chat_group from chat_groups
    const { data: chatGroup, error: chatGroupError } = await supabase.from('chat_groups').select('*').eq('id', chatId).single();
    let users_with_permission = chatGroup?.users_with_permission || [];

    let usersUpdateError = false;
    // update users table to remove chat from user's user_groups (promise.all)
    for (let i = 0; i < users_with_permission.length; i++) {
      const user_id = users_with_permission[i];
      const { data, error } = await supabase.from('users').select('user_groups').eq('user_id', user_id).single();
      let user_groups = data?.user_groups || [];
      user_groups = user_groups.filter((group: string) => group !== chatId);
      const { data: userData, error: userError } = await supabase.from('users').update({ user_groups }).eq('user_id', user_id);
      if (userError) {
        usersUpdateError = true;
      }
    }



    if (usersUpdateError || chatGroupError) {
      toast({
        title: "Error!",
        description: "Failed to delete chat!",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
      setOpen(false);
      return;
    }

    // delete chat from chat_groups
    const { data, error } = await supabase.from('chat_groups').delete().eq('id', chatId);

    if (error) {
      toast({
        title: "Error!",
        description: "Failed to delete chat!",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
      setOpen(false);
      return;
    }


    toast({
      title: "Success!",
      description: "You have successfully deleted your chat!",
      className: "bg-green-600 text-white",
      duration: 2000,
    });
    setOpen(false);
    router.push("/chat");

  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete Chat</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-xl dark:bg-black shadow-lg shadow-black dark:shadow-lg dark:shadow-white/30">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will delete the chat for all users.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 space-x-2">
            <Button variant={"destructive"} onClick={handleDelete}>
              Delete
            </Button>

            <Button variant={"outline"} onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>

  );
}

export default DeleteChatButton;
