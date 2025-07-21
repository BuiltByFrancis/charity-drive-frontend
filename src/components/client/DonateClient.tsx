"use client";

import { useWriteContract } from "wagmi";
import { useChainData } from "../providers/chain-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { address, abi } from "@/contracts/Token";
import { toast } from "sonner";
import { parseEther } from "viem";
import ReownConnectButton from "../connect-button";

export const DonateClient = () => {
  const { writeContract } = useWriteContract({
    mutation: {
      onError: (error) => {
        toast.error(error.name + ": " + error.message);
      },
      onSuccess: () => {
        toast.success("Transaction successful!");
      },
    },
  });

  const { user, donatedWeth, donatedToken, refetchBalance } = useChainData();

  function handleMintTestToken() {
    if (!user) {
      toast.error("No user connected");
      return;
    }

    writeContract({
      address,
      abi,
      functionName: "mint",
      args: [user, parseEther("1000")],
    });

    refetchBalance();
  }

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Donate</CardTitle>
        <CardDescription>Donate 1% of your Ether / Token holdings to the charity pool.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Donated WETH: {donatedWeth}</p>
        <p>Donated Token: {donatedToken}</p>
      </CardContent>
      <CardFooter className="flex w-full justify-end">
        <ReownConnectButton />
      </CardFooter>
    </Card>
  );
};
