"use client";

import { useChainData } from "../providers/chain-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { formatEther } from "viem";
import ReownConnectButton from "../connect-button";
import { useWriteSync } from "../providers/write-sync";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { formatNumber } from "@/lib/utils";
import { address as charityAddress, abi as charityABI } from "@/contracts/CharityPool";
import { address as wethAddress, abi as wethABI } from "@/contracts/WETH9";
import { address as tokenAddress, abi as tokenABI } from "@/contracts/Token";

export const DonateClient = () => {
  const { isBusy, writeContract } = useWriteSync();
  const { user, balance, wethBalance, tokenBalance, tokenAllowance, refetch, refetchBalance } = useChainData();

  function handleDonateToken() {
    if (!user) {
      return;
    }

    const onePercent = tokenBalance / BigInt(100);

    if (tokenAllowance < onePercent) {
      handleApprove();
    } else{
      handleDonate();
    }

    function handleApprove() {
      writeContract({
        address: tokenAddress,
        abi: tokenABI,
        functionName: "approve",
        args: [charityAddress, onePercent],
        onReceipt: () => {
          refetchBalance();
          handleDonate();
        },
      });
    }

    function handleDonate() {
      writeContract({
        address: charityAddress,
        abi: charityABI,
        functionName: "donateToken",
        args: [tokenAddress, onePercent],
        onReceipt: () => {
          refetch();
        },
      });
    }
  }

  const totalEther = useMemo(() => {
    return balance + wethBalance;
  }, [balance, wethBalance]);

  const availableEther = useMemo(() => {
    return formatEther(totalEther);
  }, [totalEther]);

  const availableToken = useMemo(() => {
    return formatEther(tokenBalance);
  }, [tokenBalance]);

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Donate</CardTitle>
        <CardDescription>Donate 1% of your Ether / Token holdings to the charity pool.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Available ETH Balance: {availableEther}</p>
        <p>Available Token Balance: {availableToken}</p>
      </CardContent>
      <CardFooter className="flex w-full justify-between">
        <div className="flex flex-row gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={handleDonateToken} disabled={user === undefined || isBusy}>
            Donate {formatNumber(parseFloat(formatEther(totalEther / BigInt(100))))} ETH
          </Button>
          <Button variant="outline" className="cursor-pointer" onClick={handleDonateToken} disabled={user === undefined || isBusy}>
            Donate {formatNumber(parseFloat(formatEther(tokenBalance / BigInt(100))))} Token
          </Button>
        </div>
        <ReownConnectButton />
      </CardFooter>
    </Card>
  );
};
