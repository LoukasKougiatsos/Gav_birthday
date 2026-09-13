import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-xl font-semibold text-clay">Our Corner</p>
      <p className="text-sm text-ink/60">Μόνο για σένα.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
