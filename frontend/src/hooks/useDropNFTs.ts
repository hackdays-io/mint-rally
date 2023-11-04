import { useForwarderContract, useMintNFTContract } from "./useMintNFT";
import { ContractEvent, useContractEvents, useContractWrite, useSDK, useSigner } from "@thirdweb-dev/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Event } from "types/Event";
import { signMetaTxRequest } from "utils/signer";
import axios from "axios";
import { useCurrentBlock } from "./useBlockChain";

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
    status: "error" | "idle" | "loading" | "success" | "submitted";
  }>({
    error: null,
    isLoading: false,
    status: "idle",
  });

  const fromBlock = useCurrentBlock();
  const { data } = useContractEvents(mintNFTContract, "DroppedNFTs", {
    queryFilter: {
      filters: {
        from: null,
        to: address,
        fromBlock: fromBlock,
      },
    },
    subscribe: true,
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
      }
    },
    [event, mutateAsync]
  );
  useEffect(() => {
    const includesNewEvent = (data: ContractEvent<Record<string, any>>[]) => {
      if (!fromBlock) return false;
      return data.some((event) => {
        return event.transaction.blockNumber > fromBlock;
      });
    };
    if (status !== "success" || !data || !includesNewEvent(data)) return;
    console.log(data);
    setDropStatus({ ...dropStatus, status: "success", isLoading: false });
  }, [data, status, fromBlock]);

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
        // Transaction submitted
        setDropStatus({ ...dropStatus, status: "submitted", isLoading: false });
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