"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

type AuthButtonProps = {
  user: any | null;
  className?: string;
};

export function AuthButton({ user, className }: AuthButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">("sign-in");
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error("Failed to sign out");
      }

      // Refresh the page to update UI
      router.refresh();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    endpoint: string,
  ) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Use Supabase client directly instead of fetch API
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const supabase = createClient();

      let result;
      if (endpoint.includes("sign-up")) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        throw new Error(result.error.message || "Authentication failed");
      }

      // Close dialog and refresh the page
      setIsOpen(false);
      router.refresh();

      if (endpoint.includes("sign-up")) {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={handleSignOut}
        disabled={isLoading}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoading ? "Signing out..." : "Sign out"}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <LogIn className="h-4 w-4 mr-2" />
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            Sign in to save your receipts and access them from any device.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "sign-in" | "sign-up")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <form
              onSubmit={(e) => handleFormSubmit(e, "/api/auth/sign-in")}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="sign-up">
            <form
              onSubmit={(e) => handleFormSubmit(e, "/api/auth/sign-up")}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
