
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const redirectUrl = `${window.location.origin}/`;

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const switchMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Login success", description: "Welcome back!" });
        navigate("/"); // Redirect to home after login
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) {
        setError(error.message);
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Signup success", description: "Check your email to confirm your account." });
        navigate("/"); // Redirect to home after signup
      }
    }
    setPending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-2">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="max-w-md w-full bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-center text-foreground">{mode === "login" ? "Log In" : "Sign Up"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email"
              required
              value={email}
              disabled={pending}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="password"
              placeholder="Password"
              required
              value={password}
              disabled={pending}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            {error && <div className="text-destructive text-sm text-center">{error}</div>}
            <Button type="submit" disabled={pending}>
              {pending
                ? mode === "login"
                  ? "Logging in..."
                  : "Signing up..."
                : mode === "login"
                  ? "Log In"
                  : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center">
            {mode === "login" ? (
              <>
                New to QuizGame?{" "}
                <button
                  className="text-primary underline hover:text-primary/80"
                  onClick={switchMode}
                  disabled={pending}
                  type="button"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-primary underline hover:text-primary/80"
                  onClick={switchMode}
                  disabled={pending}
                  type="button"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
