
import ChatListRows from "./ChatListRows";

async function ChatList() {
  const session = null;

  const initialChats: any[] = [];

  return <ChatListRows initialChats={initialChats} />;
}

export default ChatList;
