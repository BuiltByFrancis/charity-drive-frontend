import { sepolia as testnet } from "viem/chains";
import { type Chain } from "viem";
import { Network } from "alchemy-sdk";
import { AppKitNetwork, sepolia as reown } from '@reown/appkit/networks';
import { env } from "@/env.mjs";
import App from "next/app";

function rpcUrl(chainId: number) {
  if (typeof window !== "undefined") {
    return `${window.origin}/api/rpc/${chainId}`;
  }

  return `${env.NEXT_PUBLIC_VERCEL_URL}/api/rpc/${chainId}?x-vercel-protection-bypass=${env.VERCEL_AUTOMATION_BYPASS_SECRET}`;
}

function defineAlchemyChain(chain: Chain, network: Network) {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      alchemy: {
        http: [`https://${network}.g.alchemy.com/v2`],
        webSocket: [`wss://${network}.g.alchemy.com/v2`],
      },
    },
  };
}

function defineAppChain(chain: ReturnType<typeof defineAlchemyChain>) {
  return {
    ...chain,
    rpcUrls: {
      default: chain.rpcUrls.default,
      alchemy: chain.rpcUrls.alchemy,
      app: {
        http: [rpcUrl(chain.id)],
      },
    },
  };
}

export const sepolia = defineAppChain(defineAlchemyChain(testnet, Network.ETH_SEPOLIA));

export const chains = [sepolia] as const;
export const reownChains: [AppKitNetwork, ...AppKitNetwork[]] = [reown];