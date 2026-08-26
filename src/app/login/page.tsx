import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/ui/submit-button";

async function loginAction(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; joined?: string }>;
}) {
  const { error, joined } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <Logo size={36} />
      <form
        action={loginAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <h1 className="text-xl font-bold">Log in</h1>
        {joined && (
          <p className="text-sm text-income">Account created — log in with your new password.</p>
        )}
        {error && <p className="text-sm text-expense">Invalid email or password.</p>}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton
          className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          pendingText="Logging in…"
        >
          Log in
        </SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          New to Splizo?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create a household
          </Link>
        </p>
      </form>
    </div>
  );
}
