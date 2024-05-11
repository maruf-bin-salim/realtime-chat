import { Delete } from "lucide-react";
import InviteUser from "./InviteUser";
import DeleteChatButton from "./DeleteChatButton";
import ShareLink from "./ShareLink";

function AdminControls({ chatId }: { chatId: string }) {
  return (
    <div className="flex justify-end space-x-2 m-5 mb-0">
      <InviteUser chatId={chatId} />
      <ShareLink chatId={chatId} />
      <DeleteChatButton chatId={chatId} />
    </div>
  );
}

export default AdminControls;
