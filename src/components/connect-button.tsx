"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function ReownConnectButton() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();

  const shorten = (addr?: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  if (isConnected)
    return (
      <Button variant="default" onClick={() => open({ view: "Account" })}>
        {shorten(address)}
      </Button>
    );

  return (
    <Button
      variant="default"
      onClick={() => {
        open({ view: "Connect", namespace: "eip155" });
      }}
    >
      Connect Wallet
    </Button>
  );
}
