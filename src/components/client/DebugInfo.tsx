"use client";

import { useWriteContract } from "wagmi";
import { useChainData } from "../providers/chain-data";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { address, abi } from "@/contracts/Token";
import { toast } from "sonner";
import { parseEther } from "viem";

export const DebugClient = () => {
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
  }

  return (
    <Card className="absolute top-6 right-6 w-80">
      <CardHeader className="text-lg font-semibold w-full">Debug</CardHeader>
      <CardContent>
        <p>Donated WETH: {donatedWeth}</p>
        <p>Donated Token: {donatedToken}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleMintTestToken} disabled={user === undefined}>
          Mint Test Token
        </Button>
      </CardFooter>
    </Card>
  );
};
