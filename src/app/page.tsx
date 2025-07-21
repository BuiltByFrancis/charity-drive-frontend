import { DebugClient } from "@/components/client/DebugInfo";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative font-sans w-screen h-screen flex items-center justify-center">
      <DebugClient />
    </div>
  );
}
