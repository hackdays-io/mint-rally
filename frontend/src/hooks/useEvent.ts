import {
  ContractEvent,
  useContract,
  useContractEvents,
  useContractWrite,
} from "@thirdweb-dev/react";
import eventManagerABI from "../contracts/EventManager.json";
import { Event } from "types/Event";
import { useCallback, useEffect, useState } from "react";
import { useCurrentBlock } from "./useBlockChain";

export const useEventManagerContract = () => {
  const {
    contract: eventManagerContract,
    isLoading,
    error,
  } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_EVENT_MANAGER!,
    eventManagerABI.abi
  );

  return { eventManagerContract, isLoading, error };
};

export const useCreateEventGroup = (address: string) => {
  const { eventManagerContract } = useEventManagerContract();
  const {
    mutateAsync,
    isLoading: isCreating,
    error: createError,
    status: createStatus,
  } = useContractWrite(eventManagerContract, "createGroup");
  const fromBlock = useCurrentBlock();
  const { data } = useContractEvents(eventManagerContract, "CreatedGroupId", {
    queryFilter: {
      filters: {
        owner: address,
        groupId: null,
        fromBlock: fromBlock,
      },
    },
    subscribe: true,
  });

  const [createdGroupId, setCreatedGroupId] = useState<number | null>(null);

  useEffect(() => {
    const includesNewEvent = (data: ContractEvent<Record<string, any>>[]) => {
      if (!fromBlock) return false;
      return data.some((event) => {
        return event.transaction.blockNumber > fromBlock;
      });
    };
    if (createStatus !== "success" || !data || !includesNewEvent(data)) return;
    const groupId = data
      .sort((a, b) => {
        return b.transaction.blockNumber - a.transaction.blockNumber;
      })[0]
      .data?.groupId.toNumber();
    setCreatedGroupId(groupId);
  }, [data, createStatus, fromBlock]);

  const createEventGroup = useCallback(
    async (params: { groupName: string }) => {
      if (!params.groupName) return;
      try {
        await mutateAsync({ args: [params.groupName] });
      } catch (_) {}
    },
    [mutateAsync]
  );

  return {
    createEventGroup,
    createdGroupId,
    isCreating,
    createStatus,
    createError,
  };
};
