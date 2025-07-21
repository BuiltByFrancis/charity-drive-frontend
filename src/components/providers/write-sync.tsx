"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Config, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { WriteContractMutate } from "wagmi/query";
import { toast } from "sonner";

import type { WriteContractParameters } from "wagmi/actions";

type BaseConfig = WriteContractParameters;

interface WriteSyncData {
  isBusy: boolean;
  writeContract: (config: BaseConfig & { onReceipt?: () => void }) => void;
}

const WriteContext = createContext<WriteSyncData | null>(null);

export const WriteSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>();

  const { writeContract } = useWriteContract({
    mutation: {
      onMutate: () => setIsBusy(true),
      onError: (err) => {
        if (!err.message.includes("User rejected")) {
          toast.error(`${err.name}: ${err.message}`);
        }

        setIsBusy(false);
      },
      onSuccess: (hash) => {
        setTxHash(hash);
        toast(`Transaction sent: ${hash.slice(0, 10)}…`);
      },
    },
  });

  const { isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1, // Wait until at least 1 block confirmation
  });

  function writeWithReceipt(config: BaseConfig & { onReceipt?: () => void }) {
    const { onReceipt, ...baseConfig } = config;

    if (onReceipt) {
      setOnSuccess(() => onReceipt);
    }

    return writeContract(baseConfig);
  }

  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      toast.success("Transaction confirmed!");
      
      const toCall = onSuccess;

      setIsBusy(false);
      setTxHash(undefined);
      setOnSuccess(undefined);

      toCall?.();
    } else if (isError) {
      toast.error("Transaction failed: " + error?.message);
      setIsBusy(false);
      setTxHash(undefined);
      setOnSuccess(undefined);
    }
  }, [isSuccess, isError, txHash, error]);

  const value = useMemo(() => ({ writeContract: writeWithReceipt, isBusy }), [isBusy, writeContract]);

  return <WriteContext.Provider value={value}>{children}</WriteContext.Provider>;
};

export function useWriteSync() {
  const ctx = useContext(WriteContext);
  if (!ctx) throw new Error("useWriteSync must be used within WriteSyncProvider");
  return ctx;
}
