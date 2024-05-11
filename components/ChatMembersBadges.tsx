"use client";

// import useAdminId from "@/hooks/useAdminId";
// import { ChatMembers, chatMembersRef } from "@/lib/converters/ChatMembers";
// import { useCollectionData } from "react-firebase-hooks/firestore";
import LoadingSpinner from "./LoadingSpinner";
import { Badge } from "./ui/badge";
import UserAvatar from "./UserAvatar";

function ChatMembersBadges({ memberBadges }: { memberBadges: any[] }) {

  const members: any[] = memberBadges;
  const loading = false;
  const error = false;

  const adminId = null;

  if (loading && !members) return <LoadingSpinner />;

  return (
    !loading && (
      <div className="p-2 border rounded-xl m-5">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 p-2">
          {members?.map((member) => (
            <Badge
              variant="outline"
              key={member.email}
              className="h-14 p-5 pl-2 pr-5 space-x-2 rounded-xl"
            >
              <div className="flex items-center space-x-2">
                <UserAvatar name={member.email} image={member.avatar} />
              </div>
              <div>
                <p>{member.email}</p>
                {member.isAdmin && (
                  <p className="text-indigo-400 animate-pulse">Admin</p>
                )}
              </div>
            </Badge>
          ))}
        </div>
      </div>
    )
  );
}

export default ChatMembersBadges;
