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
) => {
  const { mintNFTContract } = useMintNFTContract();
  const { forwarderContract } = useForwarderContract();
  const signer = useSigner();
  const sdk = useSDK();

  const {
    mutateAsync,
    isLoading: isDropping,
    error: dropError,
    status: contractStatus,
  } = useContractWrite(mintNFTContract, "dropNFTs");
  const [dropStatus, setDropStatus] = useState<{
    error: any;
    isLoading: boolean;
    status: "error" | "idle" | "loading" | "success";
  }>({
    error: null,
    isLoading: false,
    status: "idle",
  });

  const error: any = useMemo(() => {
    return dropStatus.error || dropError;
  }, [dropError, dropStatus]);
  const isLoading = useMemo(() => {
    return dropStatus.isLoading || isDropping;
  }, [isDropping, dropStatus]);
  const status = useMemo(() => {
    return dropStatus.status;
  }, [dropStatus]);

  const dropNFTs = useCallback(
    async (addresses: string[]) => {
      if (!event || !event.eventRecordId) return;
      try {
        console.log('dropNFTs', event.eventRecordId, addresses);
        await mutateAsync({
          args: [event.eventRecordId, addresses],
        });
      } catch (error) {
        console.log('dropNFTs error', error);
        setDropStatus({ ...dropStatus, error, status: "error" });
      }
    },
    [event, mutateAsync]
  );

  const dropNFTsMTX = useCallback(
    async (addresses: string[]) => {
      if (!event || !event.eventRecordId || !event.groupId || !sdk) return;
      setDropStatus({ isLoading: true, status: "loading", error: null });
      try {
        console.log("dropNFTsMTX", event.eventRecordId, addresses);
        const to = mintNFTContract?.getAddress();
        const from = address;
        const data = mintNFTContract?.encoder.encode("dropNFTs", [
          event?.eventRecordId,
          addresses
        ]);
        const request = await signMetaTxRequest(sdk.wallet, forwarderContract, {
          from,
          to,
          data,
        });
        const { data: response } = await axios.post("/api/autotask", {
          request: request.request,
          signature: request.signature.signature,
        });
        console.log('success', response);
        setDropStatus({ ...dropStatus, status: "success", isLoading: false });
        return response;
      } catch (error) {
        setDropStatus({ ...dropStatus, error, status: "error" });
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