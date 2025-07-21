import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { env } from '@/env.mjs'
import { reownChains } from '@/lib/chain';

export const projectId = env.NEXT_PUBLIC_PROJECT_ID

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: reownChains
})

export const config = wagmiAdapter.wagmiConfig