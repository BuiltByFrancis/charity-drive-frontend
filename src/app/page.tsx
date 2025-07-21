import { DebugClient } from "@/components/client/DebugInfo";
import { DonateClient } from "@/components/client/DonateClient";

export default function Home() {
  return (
    <div className="relative font-sans w-screen h-screen flex items-center justify-center">
      <DebugClient />
      <DonateClient />
    </div>
  );
}
