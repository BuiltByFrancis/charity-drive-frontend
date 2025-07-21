"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { erc20Abi, formatEther, Hex } from "viem";
import { usePublicClient } from "wagmi";
import { address as wethAddress } from "@/contracts/WETH9";
import { address as tokenAddress } from "@/contracts/Token";
import { address as charityPoolAddress, abi as charityPoolAbi } from "@/contracts/CharityPool";

interface OnchainData {
  user?: Hex;

  balance?: bigint;
  wethBalance?: bigint;
  tokenBalance?: bigint;

  donatedWeth: string;
  donatedToken: string;

  refetchBalance: () => void;
  refetchDonated: () => void;

  refetch: () => void;
}

const ChainContext = createContext<OnchainData | null>(null);

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAppKitAccount();

  const client = usePublicClient();

  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ["chainData", address],
    queryFn: async () => {
      if (!address || !client) return { balance: undefined, wethBalance: undefined, tokenBalance: undefined };

      const balance = await client.getBalance({ address: address as Hex, blockTag: "latest" });
      const [wethBalance, tokenBalance] = await client.multicall({
        contracts: [
          {
            address: wethAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address as Hex],
          },
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address as Hex],
          },
        ],
        blockTag: "latest",
        allowFailure: false,
        multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
      });

      return { balance, wethBalance, tokenBalance };
    },
    enabled: !!address,
  });

  const { data: donatedData, refetch: refetchDonated } = useQuery({
    queryKey: ["donatedData", charityPoolAddress],
    queryFn: async () => {
      if (!address || !client) return { donatedWeth: undefined, donatedToken: undefined };

      const [donatedWeth, donatedToken] = await client.multicall({
        contracts: [
          {
            address: charityPoolAddress,
            abi: charityPoolAbi,
            functionName: "tokenBalance",
            args: [wethAddress],
          },
          {
            address: charityPoolAddress,
            abi: charityPoolAbi,
            functionName: "tokenBalance",
            args: [tokenAddress],
          },
        ],
        blockTag: "latest",
        allowFailure: false,
        multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
      });

      return { donatedWeth, donatedToken };
    },
    select: (data) => ({
      donatedWeth: formatEther(data.donatedWeth ?? BigInt(0)),
      donatedToken: formatEther(data.donatedToken ?? BigInt(0)),
    }),
    enabled: !!address,
  });

  const value = useMemo<OnchainData>(
    () => ({
      user: address as Hex,
      balance: balanceData?.balance,
      wethBalance: balanceData?.wethBalance,
      tokenBalance: balanceData?.tokenBalance,
      donatedWeth: donatedData?.donatedWeth ?? "0",
      donatedToken: donatedData?.donatedToken ?? "0",
      refetchBalance: () => refetchBalance(),
      refetchDonated: () => refetchDonated(),
      refetch: () => {
        refetchBalance();
        refetchDonated();
      },
    }),
    [balanceData, donatedData]
  );
  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
};

export function useChainData() {
  const context = useContext(ChainContext);
  if (!context) throw new Error("useChainData must be used within a ChainProvider");
  return context;
}
