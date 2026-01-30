import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock } from "lucide-react";
import { validateSignIn } from "@/lib/validation";

interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function SignInForm({ onSubmit, loading, error }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationMsg = validateSignIn(email, password);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }

    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            disabled={loading}
            required
          />
        </div>
      </div>

      {(validationError || error) && (
        <div className="p-3 rounded-lg text-sm bg-destructive/20 text-destructive border border-destructive/30">
          {validationError || error}
        </div>
      )}

      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
