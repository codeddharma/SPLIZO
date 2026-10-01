import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Create Your Household",
  description: "Start tracking your household's finances on Splizo — free during the private beta.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <Logo size={36} />
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <h1 className="mb-1 text-xl font-bold">Create your household</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Start tracking your household&apos;s finances on Splizo.
        </p>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
