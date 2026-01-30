import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { cn } from "@/lib/utils";

interface LoginProps {
  initialTab?: 'login' | 'signup';
}

export default function Login({ initialTab = 'login' }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(initialTab === 'signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSignUp = async (email: string, password: string, username: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await signUp(email, password, username);
      if (result.error) {
        setError(result.error as string);
      } else {
        setSuccess("Account created successfully! Redirecting to compete...");
        setTimeout(() => {
          navigate("/compete");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error as string);
      } else {
        setSuccess("Signed in successfully! Redirecting...");
        setTimeout(() => {
          navigate("/compete");
        }, 500);
      }
    } catch (err: any) {
      console.error("Signin error:", err);
      setError(err.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (signup: boolean) => {
    setIsSignUp(signup);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Codeverse</h1>
          <p className="text-muted-foreground">Competitive coding battles in real-time</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl space-y-6">
          {/* Tab Toggle */}
          <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => toggleTab(false)}
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                !isSignUp
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleTab(true)}
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                isSignUp
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {isSignUp ? (
            <SignUpForm onSubmit={handleSignUp} loading={loading} error={error} />
          ) : (
            <SignInForm onSubmit={handleSignIn} loading={loading} error={error} />
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg text-sm bg-green-100/50 text-green-700 border border-green-200">
              {success}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => toggleTab(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => toggleTab(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>🔐 Secure MySQL backend authentication</p>
          <p className="mt-2">Test account coming soon</p>
        </div>
      </div>
    </div>
  );
}
