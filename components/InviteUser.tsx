"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircleIcon } from "lucide-react";
// import { ShareLink } from "./ShareLink";
import { ToastAction } from "./ui/toast";
import { useRouter } from "next/navigation";
import ShareLink from "./ShareLink";
import useSession from "@/lib/supabase/use-session";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function InviteUser({ chatId }: { chatId: string }) {
  const { toast } = useToast();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [openInviteLink, setOpenInviteLink] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {

    toast({
      title: "Sending invite...",
      description: "Hold tight while we send an invite to this user...",
      className: "bg-yellow-300 text-white",
    });

    let invitedUser = true;

    if (!invitedUser) {
      toast({
        title: "User not found!",
        description:
          "We couldn't find a registered user with that email address. Please check the email address and try again.",
        variant: "destructive",
      });
      setOpen(false);
      form.reset();
      return;
    }

    // load for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // show success message
    toast({
      title: "User added to chat!",
      description: "You have successfully added a user to this chat!",
      className: "bg-green-600 text-white",
      duration: 2000,
    });
    setOpen(false);
    form.reset();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-black dark:bg-white">
            <PlusCircleIcon className="mr-1" />
            <p className="hidden md:block">
                Add User to Chat
              </p>
              <p className="md:hidden">
                Add
              </p>
          </Button>
        </DialogTrigger>

        <DialogContent className="rounded-xl sm:max-w-lg dark:bg-black shadow-lg shadow-black dark:shadow-lg dark:shadow-white/30">
          <DialogHeader>
            <DialogTitle className="text-center">
                Add User to Chat
            </DialogTitle>
            <DialogDescription className="text-center">
              Simply enter another users email address to invite them to this
              chat!{" "}
              <span className="text-black dark:text-white font-bold">
                (NOTE: They must already have an account!)
              </span>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-2"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="dummy@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="bg-black dark:bg-white ml-auto sm:w-fit w-full"
                type="submit"
              >
                Add to Chat
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </>
  );
}

export default InviteUser;

