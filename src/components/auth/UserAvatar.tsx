"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";

type UserAvatarProps = {
  user: User | null;
  className?: string;
};

export function UserAvatar({ user, className }: UserAvatarProps) {
  if (!user) return null;

  // Get initials from name in user_metadata or email
  const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <Avatar className={className}>
      <AvatarImage src={user.user_metadata?.avatar_url} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
