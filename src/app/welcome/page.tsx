import { Suspense } from "react";
import { WelcomeVideo } from "@/components/welcome/WelcomeVideo";

export default function WelcomePage() {
  return (
    <Suspense>
      <WelcomeVideo />
    </Suspense>
  );
}
