import {
  ContractEvent,
  useAddress,
  useContract,
  useContractEvents,
  useContractRead,
  useContractWrite,
  useSDK,
} from "@thirdweb-dev/react";
import eventManagerABI from "../contracts/EventManager.json";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentBlock } from "./useBlockChain";
import { Event } from "types/Event";
import { ethers } from "ethers";
import { reverse } from "lodash";
import { EVENT_BLACK_LIST } from "src/constants/event";

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
  const { data } = useContractEvents(eventManagerContract, "CreateGroup", {
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
    const includesNewEventGroup = (
      data: ContractEvent<Record<string, any>>[]
    ) => {
      if (!fromBlock) return false;
      return data.some((event) => {
        return event.transaction.blockNumber > fromBlock;
      });
    };
    if (createStatus !== "success" || !data || !includesNewEventGroup(data))
      return;
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

/**
 * custom hook function for get login user's groups
 */
export const useOwnEventGroups = () => {
  const { eventManagerContract } = useEventManagerContract();
  const address = useAddress();
  const {
    isLoading,
    data: groups,
    error,
  } = useContractRead(eventManagerContract, "getOwnGroups", [address]);

  return { groups, isLoading, error };
};

export const useEventGroups = () => {
  const { eventManagerContract } = useEventManagerContract();
  const { isLoading, data: groups } = useContractRead(
    eventManagerContract,
    "getGroups"
  );

  return { groups, isLoading };
};

export const useCreateEvent = (address: string) => {
  const { eventManagerContract } = useEventManagerContract();
  const provider = useSDK()?.getProvider();

  const {
    mutateAsync,
    isLoading: isCreating,
    error: createError,
    status: createStatus,
  } = useContractWrite(eventManagerContract, "createEventRecord");
  const fromBlock = useCurrentBlock();

  const { data } = useContractEvents(eventManagerContract, "CreateEvent", {
    queryFilter: {
      filters: {
        owner: address,
        eventId: null,
        fromBlock: fromBlock,
      },
    },
    subscribe: true,
  });

  const [createdEventId, setCreatedEventId] = useState<number | null>(null);

  useEffect(() => {
    const includesNewEvent = (data: ContractEvent<Record<string, any>>[]) => {
      if (!fromBlock) return false;
      return data.some((event) => {
        return event.transaction.blockNumber > fromBlock;
      });
    };
    if (createStatus !== "success" || !data || !includesNewEvent(data)) return;
    const eventId = data
      .sort((a, b) => {
        return b.transaction.blockNumber - a.transaction.blockNumber;
      })[0]
      .data?.eventId.toNumber();
    setCreatedEventId(eventId);
  });

  const createEvent = useCallback(
    async (params: Event.CreateEventRecordParams) => {
      if (!params || !provider) return;
      try {
        let value!: ethers.BigNumber;
        if (params.useMtx) {
          const gasPrice = (await provider.getGasPrice())?.toNumber();
          value = ethers.utils.parseEther(
            `${
              gasPrice * params.mintLimit * 250000 * 2.1 * 0.000000000000000001
            }`
          );
        }

        await mutateAsync({
          args: [
            params.groupId,
            params.eventName,
            params.description,
            `${params.date.toLocaleDateString()} ${params.startTime}~${
              params.endTime
            }`,
            params.mintLimit,
            params.useMtx,
            params.secretPhrase,
            params.attributes,
          ],
          overrides: {
            value: params.useMtx ? value : 0,
          },
        });
      } catch (_) {}
    },
    [mutateAsync, provider]
  );

  return {
    createEvent,
    createdEventId,
    isCreating,
    createStatus,
    createError,
  };
};

export const useEvents = () => {
  const { eventManagerContract } = useEventManagerContract();
  const { isLoading, data, error } = useContractRead(
    eventManagerContract,
    "getEventRecords"
  );

  const events = useMemo(() => {
    return reverse(
      data?.filter(
        (e: any) => !EVENT_BLACK_LIST.includes(e.eventRecordId.toNumber())
      )
    );
  }, [data]);

  return { events, isLoading, error };
};

export const useEventById = (id: number) => {
  const { eventManagerContract } = useEventManagerContract();
  const {
    isLoading,
    data: event,
    error,
  } = useContractRead(eventManagerContract, "getEventById", [id]);

  return { event, isLoading, error };
};
