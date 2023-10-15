import { BigNumber } from "ethers";
import { useForwarderContract, useMintNFTContract } from "./useMintNFT";
import { useContractWrite, useSDK, useSigner } from "@thirdweb-dev/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Event } from "types/Event";
import { signMetaTxRequest } from "utils/signer";
import axios from "axios";

export const useDropNFTs = (
  event: Event.EventRecord,
  address: string,
  useMTX: boolean = false
) => {
  const { mintNFTContract } = useMintNFTContract();
  const { forwarderContract } = useForwarderContract();
  const signer = useSigner();
  const sdk = useSDK();

  const {
    mutateAsync,
    isLoading: isMinting,
    error: mintError,
    status: mintStatus,
  } = useContractWrite(mintNFTContract, "dropNFTs");
  const [mtxStatus, setMtxStatus] = useState<{
    error: any;
    isLoading: boolean;
    status: "error" | "idle" | "loading" | "success";
  }>({
    error: null,
    isLoading: false,
    status: "idle",
  });

  const error: any = useMemo(() => {
    return mtxStatus.error || mintError;
  }, [mintError, mtxStatus]);
  const isLoading = useMemo(() => {
    return mtxStatus.isLoading || isMinting;
  }, [isMinting, mtxStatus]);
  const status = useMemo(() => {
    return useMTX ? mtxStatus.status : mintStatus;
  }, [mintStatus, mtxStatus]);

  const dropNFTs = useCallback(
    async (addresses: string[]) => {
      if (!event || !event.eventRecordId) return;
      console.log('dropNFTs', event.eventRecordId, addresses);
      await mutateAsync({
        args: [event.eventRecordId, addresses],
      });
    },
    [event, mutateAsync]
  );

  const dropNFTsMTX = useCallback(
    async (addresses: string[]) => {
      if (!event || !event.eventRecordId || !event.groupId || !sdk) return;
      setMtxStatus({ isLoading: true, status: "loading", error: null });
      try {
        // const to = mintNFTContract?.getAddress();
        const from = address;
        const data = mintNFTContract?.encoder.encode("dropNFTs", [
          event?.eventRecordId.toNumber(),
          addresses
        ]);
        const request = await signMetaTxRequest(sdk.wallet, forwarderContract, {
          from,
          data,
        });
        const { data: response } = await axios.post("/api/autotask", {
          request: request.request,
          signature: request.signature.signature,
        });
        setMtxStatus({ ...mtxStatus, status: "success", isLoading: false });
        return response;
      } catch (error) {
        setMtxStatus({ ...mtxStatus, error, status: "error" });
      }
    },
    [event, forwarderContract, signer]
  );

  return {
    dropNFTs,
    dropNFTsMTX,
    isLoading,
    error,
    status
  };
};