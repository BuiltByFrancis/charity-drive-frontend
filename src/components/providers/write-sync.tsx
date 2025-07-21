"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Config, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { WriteContractMutate } from "wagmi/query";
import { toast } from "sonner";

interface WriteSyncData {
  isBusy: boolean;
  writeContract: WriteContractMutate<Config, unknown>;
}

const WriteContext = createContext<WriteSyncData | null>(null);

export const WriteSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContract } = useWriteContract({
    mutation: {
      onMutate: () => setIsBusy(true),
      onError: (err) => {
        if (!err.message.includes("User rejected transaction")) {
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

  const {
    data: receipt,
    isSuccess,
    isError,
    error,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1, // Wait until at least 1 block confirmation
  });

  // React when receipt updates
  useEffect(() => {
    if (!txHash) return;

    if (isSuccess) {
      toast.success("Transaction confirmed!");
      setIsBusy(false);
      setTxHash(undefined);
    } else if (isError) {
      toast.error("Transaction failed: " + error?.message);
      setIsBusy(false);
      setTxHash(undefined);
    }
  }, [isSuccess, isError, txHash, error]);

  const value = useMemo(() => ({ isBusy, writeContract }), [isBusy, writeContract]);

  return <WriteContext.Provider value={value}>{children}</WriteContext.Provider>;
};

export function useWriteSync() {
  const ctx = useContext(WriteContext);
  if (!ctx) throw new Error("useWriteSync must be used within WriteSyncProvider");
  return ctx;
}
