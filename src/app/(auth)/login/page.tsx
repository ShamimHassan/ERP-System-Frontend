import LoginForm from "@/components/features/auth/LoginForm";
import BackendWarmup from "@/components/providers/BackendWarmup";

export default function LoginPage() {
  return (
    <>
      {/* Silently pings the backend while the user fills in the form,
          so by the time they click "Sign in" the serverless function
          is already warm → no cold-start delay on login. */}
      <BackendWarmup />
      <LoginForm />
    </>
  );
}
