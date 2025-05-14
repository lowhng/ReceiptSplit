"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";

type UserAvatarProps = {
  user: User | null;
  className?: string;
};

export function UserAvatar({ user, className }: UserAvatarProps) {
  if (!user) return null;

  // Get initials from email
  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <Avatar className={className}>
      <AvatarImage src={user.user_metadata?.avatar_url} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
