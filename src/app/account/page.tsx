import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AccountPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch user profile data from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center sm:p-4 md:p-8 py-9 w-full">
      <header className="w-full max-w-5xl mb-4 sm:mb-8 text-center mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 sm:mb-2">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your account and saved receipts
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-4 sm:gap-8 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.name || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Account created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <form action="/api/auth/sign-out" method="post">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
