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
import { BigNumber, ethers } from "ethers";
import { reverse } from "lodash";
import { useGenerateProof } from "./useSecretPhrase";
import dayjs from "dayjs";

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
    data: _groups,
    error,
  } = useContractRead(eventManagerContract, "getOwnGroups", [address]);

  const groups = useMemo(() => {
    return _groups?.filter((group: any) => {
      const blackList = process.env.NEXT_PUBLIC_EVENT_GROUP_BLACK_LIST
        ? JSON.parse(`[${process.env.NEXT_PUBLIC_EVENT_GROUP_BLACK_LIST}]`)
        : [];
      return !blackList.includes(group.groupId.toNumber());
    });
  }, [_groups]);

  return { groups, isLoading, error };
};

export const useCollaboratorAccessEventGroups = () => {
  const { eventManagerContract } = useEventManagerContract();
  const address = useAddress();
  const {
    isLoading,
    data: _groups,
    error,
  } = useContractRead(eventManagerContract, "getCollaboratorAccessGroups", [
    address,
  ]);

  const groups = useMemo(() => {
    return _groups?.filter((group: any) => {
      const blackList = process.env.NEXT_PUBLIC_EVENT_GROUP_BLACK_LIST
        ? JSON.parse(`[${process.env.NEXT_PUBLIC_EVENT_GROUP_BLACK_LIST}]`)
        : [];
      return !blackList.includes(group.groupId.toNumber());
    });
  }, [_groups]);

  return { groups, isLoading, error };
};

export const useEventGroups = () => {
  const { eventManagerContract } = useEventManagerContract();
  const { isLoading, data: _groups } = useContractRead(
    eventManagerContract,
    "getGroups"
  );

  const groups = useMemo(() => {
    return _groups?.filter((group: any) => {
      const blackList = process.env.NEXT_PUBLIC_EVENT_GROUP_BLACK_LIST
        ? JSON.parse(`[${process.env.NEXT_PUBLIC_EVENT_GROUP_BLACK_LIST}]`)
        : [];
      return !blackList.includes(group.groupId.toNumber());
    });
  }, [_groups]);

  return { groups, isLoading };
};

export const useCreateEvent = (address: string) => {
  const { eventManagerContract } = useEventManagerContract();
  const {
    isLoading: isPreparingProof,
    error: preparingProofError,
    generateProof,
  } = useGenerateProof();
  const provider = useSDK()?.getProvider();
  const { getGasFee } = useCalcMtxGasFee();

  const {
    mutateAsync,
    isLoading,
    error,
    status: createStatus,
  } = useContractWrite(eventManagerContract, "createEventRecord");
  const fromBlock = useCurrentBlock();

  const isCreating = useMemo(() => {
    return isLoading || isPreparingProof;
  }, [isLoading, isPreparingProof]);

  const createError = useMemo(() => {
    return error || preparingProofError;
  }, [error, preparingProofError]);

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
        const proof = await generateProof(params.secretPhrase);

        let value!: ethers.BigNumber;
        if (params.useMtx) {
          value = (await getGasFee(params.mintLimit)) || BigNumber.from(0);
        }

        const startDateTime = dayjs(
          `${params.startDate} ${params.startTime}`
        ).toISOString();
        const endDateTime = dayjs(
          `${params.endDate} ${params.endTime}`
        ).toISOString();

        await mutateAsync({
          args: [
            params.groupId,
            params.eventName,
            params.description,
            `${startDateTime}/${endDateTime}`,
            params.mintLimit,
            params.useMtx,
            proof?.publicInputCalldata[0],
            params.attributes,
          ],
          overrides: {
            value: params.useMtx ? value : 0,
          },
        });
      } catch (_) {}
    },
    [mutateAsync, provider, getGasFee]
  );

  return {
    createEvent,
    createdEventId,
    isCreating,
    createStatus,
    createError,
  };
};
type UseEventOption = {
  countPerPage?: number;
  initialCursor?: number;
};
export const useEvents = (option?: UseEventOption) => {
  const COUNT_PER_PAGE = option?.countPerPage || 50;
  const { eventManagerContract } = useEventManagerContract();
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [currentCursor, setCurrentCursor] = useState<number | null>(null);
  const [prevCursor, setPrevCursor] = useState<number | null>(null);
  const {
    isLoading: isLodingCount,
    data: countData,
    error: countError,
  } = useContractRead(eventManagerContract, "getEventRecordCount");
  const [data, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // read record data
  useEffect(() => {
    if (eventManagerContract === undefined || currentCursor === null) return;
    setIsLoading(true);
    eventManagerContract
      ?.call("getEventRecords", [COUNT_PER_PAGE, currentCursor])
      .then((res: any) => {
        setEventData(res);
      })
      .catch((err: any) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentCursor, eventManagerContract]);
  if (option?.initialCursor !== undefined && currentCursor === null) {
    setCurrentCursor(option?.initialCursor);
  }

  const events = useMemo(() => {
    // return empty if both data is not set
    if (data === null || countData === undefined || currentCursor === null)
      return [];
    // set cursors for pagenation
    if (countData > data.length + currentCursor) {
      setNextCursor(currentCursor + data.length);
    } else {
      setNextCursor(null);
    }
    if (currentCursor > 0) {
      setPrevCursor(currentCursor - data.length);
    } else {
      setPrevCursor(null);
    }
    const blackList = process.env.NEXT_PUBLIC_EVENT_BLACK_LIST
      ? JSON.parse(`[${process.env.NEXT_PUBLIC_EVENT_BLACK_LIST}]`)
      : [];
    return data?.filter(
      (e: any) => !blackList.includes(e.eventRecordId.toNumber())
    );
  }, [data, countData]);

  return {
    events,
    isLoading,
    error,
    countData,
    nextCursor,
    prevCursor,
    setCurrentCursor,
    COUNT_PER_PAGE,
  };
};
export const useEventsByGroupId = () => {
  const { eventManagerContract } = useEventManagerContract();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<Event.EventRecord[] | null>(null);
  const [error, setError] = useState<any>(null);
  const getEventsByGroupId = (groupId: number) => {
    console.log("getEventsByGroupId", groupId);
    setIsLoading(true);
    eventManagerContract
      ?.call("getEventRecordsByGroupId", [groupId])
      .then((res: any) => {
        setEvents(res);
      })
      .catch((err: any) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return { events, isLoading, error, getEventsByGroupId };
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

export const useCalcMtxGasFee = (mintLimit?: number) => {
  const provider = useSDK()?.getProvider();
  const [gasFee, setGasFee] = useState<BigNumber | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!provider || !mintLimit) return;

      const gasPrice = (await provider.getGasPrice())?.toNumber();
      const value = ethers.utils.parseEther(
        `${(gasPrice * mintLimit * (660000 * 1 * 0.000000000000000001)).toFixed(
          6
        )}`
      );
      setGasFee(value);
    };

    fetch();
  }, [provider, mintLimit]);

  const getGasFee = useCallback(
    async (_mintLimit: number) => {
      if (!provider) return;
      const gasPrice = (await provider.getGasPrice())?.toNumber();
      const value = ethers.utils.parseEther(
        `${(gasPrice * _mintLimit * 660000 * 1 * 0.000000000000000001).toFixed(
          6
        )}`
      );
      return value;
    },
    [provider]
  );

  return { gasFee, getGasFee };
};

export const useParseEventDate = (eventDate?: string) => {
  const parse = useCallback((_eventDate: string) => {
    if (!_eventDate) return "";
    if (_eventDate.length > 30) {
      const [startDate, endDate] = _eventDate.split("/");
      return (
        dayjs(startDate).format("YYYY/MM/DD HH:mm") +
        " ~ " +
        dayjs(endDate).format("YYYY/MM/DD HH:mm")
      );
    } else {
      return _eventDate;
    }
  }, []);

  const parsedEventDate = useMemo(() => {
    return parse(eventDate || "");
  }, [eventDate]);

  return { parsedEventDate, parse };
};

export const useGrantRole = () => {
  const { eventManagerContract } = useEventManagerContract();
  const {
    mutateAsync,
    isLoading: isGranting,
    error: grantError,
    status: grantStatus,
  } = useContractWrite(eventManagerContract, "grantRole");

  const grantRole = useCallback(
    async (params: { groupId: number; address: string; role: string }) => {
      if (!params.groupId) return;
      if (!params.address) return;
      if (!params.role) return;

      const bytes32Role = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(params.role.toUpperCase())
      );
      try {
        await mutateAsync({
          args: [params.groupId, params.address, bytes32Role],
        });
      } catch (_) {}
    },
    [mutateAsync]
  );
  return {
    grantRole,
    isGranting,
    grantStatus,
    grantError,
  };
};

export const useRevokeRole = () => {
  const { eventManagerContract } = useEventManagerContract();
  const {
    mutateAsync,
    isLoading: isRevoking,
    error: revokeError,
    status: revokeStatus,
  } = useContractWrite(eventManagerContract, "revokeRole");

  const revokeRole = useCallback(
    async (params: { groupId: number; address: string; role: string }) => {
      if (!params.groupId) return;
      if (!params.address) return;
      if (!params.role) return;

      const bytes32Role = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(params.role.toUpperCase())
      );
      try {
        await mutateAsync({
          args: [params.groupId, params.address, bytes32Role],
        });
      } catch (_) {}
    },
    [mutateAsync]
  );
  return {
    revokeRole,
    isRevoking,
    revokeStatus: revokeStatus,
    revokeError: revokeError,
  };
};

export const useMemberRole = () => {
  const { eventManagerContract } = useEventManagerContract();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [memberRole, setMemberRole] = useState<Event.MemberRole | null>(null);
  const [error, setError] = useState<any>(null);
  const getMemberRole = (groupId: number, address: string) => {
    setIsLoading(true);
    eventManagerContract
      ?.call("getMemberRole", [groupId, address])
      .then((res: any) => {
        setMemberRole(res);
      })
      .catch((err: any) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return { memberRole, isLoading, error, getMemberRole };
};

export const useMemberRoles = () => {
  const { eventManagerContract } = useEventManagerContract();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [memberRoles, setMemberRoles] =
    useState<Array<Event.MemberRole> | null>(null);
  const [error, setError] = useState<any>(null);
  const getMemberRoles = (groupId: number) => {
    setIsLoading(true);
    eventManagerContract
      ?.call("getMemberRoles", [groupId])
      .then((res: any) => {
        setMemberRoles(res);
      })
      .catch((err: any) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return { memberRoles, isLoading, error, getMemberRoles };
};
