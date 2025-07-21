"use client";

import { useChainData } from "../providers/chain-data";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { address, abi } from "@/contracts/Token";
import { parseEther } from "viem";
import { useWriteSync } from "../providers/write-sync";
import { formatNumber } from "@/lib/utils";

export const DebugClient = () => {
  const { isBusy, writeContract } = useWriteSync();
  const { user, donatedWeth, donatedToken, refetchBalance } = useChainData();

  function handleMintTestToken() {
    if (!user) {
      return;
    }

    writeContract({
      address,
      abi,
      functionName: "mint",
      args: [user, parseEther("1000")],
      onReceipt: () => {
        refetchBalance();
      },
    });
  }

  return (
    <Card className="absolute top-6 right-6 w-80">
      <CardHeader className="text-lg font-semibold w-full">Debug</CardHeader>
      <CardContent>
        <p>Donated WETH: {formatNumber(parseFloat(donatedWeth))}</p>
        <p>Donated Token: {formatNumber(parseFloat(donatedToken))}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="cursor-pointer" onClick={handleMintTestToken} disabled={user === undefined || isBusy}>
          Mint Test Token
        </Button>
      </CardFooter>
    </Card>
  );
};
