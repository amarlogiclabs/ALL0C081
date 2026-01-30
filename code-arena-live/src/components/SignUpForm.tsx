import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { validateSignUp } from "@/lib/validation";

interface SignUpFormProps {
  onSubmit: (email: string, password: string, username: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function SignUpForm({ onSubmit, loading, error }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationMsg = validateSignUp(email, password, username);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }

    await onSubmit(email, password, username);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Username
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10"
            disabled={loading}
            required
          />
        </div>
      </div>

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
        <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
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
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
