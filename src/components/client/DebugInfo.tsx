"use client";

import { useChainData } from "../providers/chain-data";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { address as tokenAddress, abi as tokenABI } from "@/contracts/Token";
import { address as wethAddress, abi as wethABI } from "@/contracts/WETH9";
import { parseEther } from "viem";
import { useWriteSync } from "../providers/write-sync";
import { formatNumber } from "@/lib/utils";

export const DebugClient = () => {
  const { isBusy, writeContract } = useWriteSync();
  const { user, balance, donatedWeth, donatedToken, refetch, refetchBalance } = useChainData();

  function handleWrap() {
    if (!user) {
      return;
    }

    const fivePercentEth = balance / BigInt(20); // 5% of balance

    writeContract({
      address: wethAddress,
      abi: wethABI,
      functionName: "deposit",
      value: fivePercentEth,
      onReceipt: () => {
        refetchBalance();
      },
    });
  }

  function handleMintTestToken() {
    if (!user) {
      return;
    }

    writeContract({
      address: tokenAddress,
      abi: tokenABI,
      functionName: "mint",
      args: [user, parseEther("1000")],
      onReceipt: () => {
        refetchBalance();
      },
    });
  }

  return (
    <Card className="absolute top-6 right-6 w-[400px]">
      <CardHeader className="text-lg font-semibold w-full">Debug</CardHeader>
      <CardContent>
        <p>Donated WETH: {formatNumber(parseFloat(donatedWeth))}</p>
        <p>Donated Token: {formatNumber(parseFloat(donatedToken))}</p>
      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Button variant="outline" className="cursor-pointer" onClick={handleWrap} disabled={user === undefined || isBusy}>
          Wrap 5% ETH
        </Button>
        <Button variant="outline" className="cursor-pointer" onClick={handleMintTestToken} disabled={user === undefined || isBusy}>
          Mint Test Token
        </Button>
      </CardFooter>
    </Card>
  );
};
