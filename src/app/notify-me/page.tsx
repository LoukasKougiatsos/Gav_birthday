import { NotificationSettings } from "@/components/push/NotificationSettings";

/**
 * Deliberately not in src/lib/nav.ts and not linked from anywhere in the
 * UI - this is where the "activity" push role (pings when she does
 * something) lives, kept off the shared Home page on purpose so she never
 * sees that toggle. Still sits behind the normal site password gate like
 * every other route.
 */
export default function NotifyMePage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-4 pb-10">
      <NotificationSettings roles={["activity"]} />
    </div>
  );
}
