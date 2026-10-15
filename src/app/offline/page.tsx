import { WifiOff } from "lucide-react";

export const metadata = { title: "You're offline" };

export default function OfflinePage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <WifiOff className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-bold text-foreground">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Splizo needs a connection to load your household&apos;s data. Reconnect and try again.
      </p>
    </div>
  );
}
