"use client";

import { AuthButton } from "@/components/auth/AuthButton";

interface PageHeaderProps {
  user: any;
}

export default function PageHeader({ user }: PageHeaderProps) {
  return (
    <header className="w-full max-w-5xl mb-4 sm:mb-8 mx-auto flex flex-col">
      <div className="w-full flex justify-end mb-2">
        <AuthButton user={user} />
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 sm:mb-2 text-center">
        ReSplit
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground text-center">
        Scan receipts and split bills with friends easily
      </p>
    </header>
  );
}
