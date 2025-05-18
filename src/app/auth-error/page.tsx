import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="mb-6 text-muted-foreground">
        There was a problem with your authentication request. Please try again.
      </p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
