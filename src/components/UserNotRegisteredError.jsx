import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function UserNotRegisteredError() {
  const { navigateToLogin } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Access not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account isn&apos;t registered for this Base44 app.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigateToLogin()}>Try a different login</Button>
        </div>
      </div>
    </div>
  );
}

