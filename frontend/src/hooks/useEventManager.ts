import {
  ChainId,
  useAddress,
  useMetamask,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_EVENT_MANAGER!;
import contract from "../contracts/EventManager.json";
export interface IEventGroup {
  groupId: BigNumber;
  name: string;
}
export interface IEventRecord {
  eventRecordId: BigNumber;
  groupId: BigNumber;
  name: string;
  description: string;
  date: Date;
  startTime: string; // "18:00"
  endTime: string; // "21:00"
}
export interface INFTImage {
  image: string;
  description: string;
  requiredParticipateCount: number;
}

export interface ICreateEventGroupParams {
  groupName: string;
  images: INFTImage[];
}

export interface ICreateEventRecordParams {
  groupId: string;
  eventName: string;
  description: string;
  date: Date;
  startTime: string; // "18:00"
  endTime: string; // "21:00"
  secretPhrase: string;
}

export interface IApplyForParticipation {
  eventId: number;
}

/**
 * A bridgge to the event manager contract
 */
export const getEventManagerContract = () => {
  const { ethereum } = window;
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum as any);
    const signer = provider.getSigner();
    if (signer) {
      console.log("address:", contractAddress);
      const _contract = new ethers.Contract(
        contractAddress,
        contract.abi,
        signer
      );
      console.log("Initialize payment");
      return _contract;
    }
  }
  return null;
};

/**
 * custom hook function for creating an event group
 * @returns
 */
export const useCreateEventGroup = () => {
  const [errors, setErrors] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();
  const createEventGroup = async (params: ICreateEventGroupParams) => {
    try {
      setLoading(true);
      setErrors(null);
      if (!address) {
        await connectWithMetamask();
      }
      if (isMismatched && switchNetwork) {
        await switchNetwork(ChainId.Mumbai);
      }
      const eventManager = getEventManagerContract();
      if (!eventManager) throw "error: contract can't found";
      const tx = await eventManager.createGroup(
        params.groupName,
        params.images
      );
      await tx.wait();
      setLoading(false);
      setStatus(true);
    } catch (e: any) {
      setErrors(e);
      setLoading(false);
    }
  };
  return { status, errors, loading, createEventGroup };
};
/**
 * custom hook function for getting all event groups
 *
 * @returns
 */
export const useEventGroups = () => {
  const [groups, setGroups] = useState<IEventGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();

  useEffect(() => {
    const getEventGroups = async () => {
      setLoading(true);
      if (!address) {
        await connectWithMetamask();
      }
      if (isMismatched && switchNetwork) {
        await switchNetwork(ChainId.Mumbai);
      }

      console.log("get event groups");
      const eventManager = getEventManagerContract();
      if (!eventManager) throw "error";
      const data = await eventManager.getGroups();
      console.log(data);
      setGroups(data);
      setLoading(false);
    };
    getEventGroups();
  }, []);

  return { groups, loading };
};

/**
 * custom hook function for get login user's groups
 */
export const useOwnEventGroups = () => {
  const [groups, setGroups] = useState<IEventGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();

  useEffect(() => {
    const getOwnEventGroups = async () => {
      setLoading(true);
      if (!address) {
        await connectWithMetamask();
      }
      if (isMismatched && switchNetwork) {
        await switchNetwork(ChainId.Mumbai);
      }
      const eventManager = getEventManagerContract();
      if (!eventManager) throw "error: contract can't found";
      const data = await eventManager.getOwnGroups();
      setLoading(false);
      setGroups(data);
      console.log(data);
    };
    getOwnEventGroups();
  }, [address]);

  return { groups, loading };
};

/**
 * custom hook function for creating an event record
 * @returns
 */
export const useCreateEventRecord = () => {
  const [errors, setErrors] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();
  const createEventRecord = async (params: ICreateEventRecordParams) => {
    setErrors(null);
    try {
      setLoading(true);
      if (!address) {
        await connectWithMetamask();
      }
      if (isMismatched && switchNetwork) {
        await switchNetwork(ChainId.Mumbai);
      }
      const eventManager = getEventManagerContract();
      if (!eventManager) throw "error: contract can't found";
      const datestr = params.date.toLocaleDateString();
      const tx = await eventManager.createEventRecord(
        params.groupId,
        params.eventName,
        params.description,
        datestr,
        params.startTime,
        params.endTime,
        params.secretPhrase
      );
      await tx.wait();
      setLoading(false);
      setStatus(true);
    } catch (e: any) {
      setErrors(e);
      setLoading(false);
    }
  };
  return { status, errors, loading, createEventRecord };
};

/**
 * custom hook function for getting all event records
 *
 * @returns
 */
export const useEventRecords = () => {
  const [records, setRecords] = useState<IEventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();

  useEffect(() => {
    const getEventRecords = async () => {
      setLoading(true);
      if (!address) {
        await connectWithMetamask();
      }
      if (isMismatched && switchNetwork) {
        await switchNetwork(ChainId.Mumbai);
      }
      console.log("get event records");
      const eventManager = getEventManagerContract();
      if (!eventManager) throw "error";
      const data = await eventManager.getEventRecords();
      console.log("retrieved:", data);
      setLoading(false);
      setRecords(data);
    };
    getEventRecords();
  }, []);

  return { records, loading };
};

/**
 * custom hook function for getting an event record by id
 *
 * @returns
 */
export const useGetEventById = (eventId: number) => {
  const [event, setEvent] = useState<IEventRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();

  useEffect(() => {
    const getEventById = async () => {
      setLoading(true);
      if (!address) {
        await connectWithMetamask();
      }
      if (isMismatched && switchNetwork) {
        await switchNetwork(ChainId.Mumbai);
      }
      if (!eventId) return;
      console.log("get an even record by id");
      const eventManager = getEventManagerContract();
      if (!eventManager) throw "error";
      const data = await eventManager.getEventById(eventId);
      console.log("retrieved: ", data);
      setLoading(false);
      setEvent(data);
    };

    getEventById();
  }, [eventId]);

  return { event, loading };
};

/**
 * custom hook function for getting the event records that the sender has applied for participation
 *
 * @returns
 */
export const useGetParticipationEventIds = () => {
  const [eventIds, setEventIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();
  const getParticipationEventIds = async () => {
    setLoading(true);
    if (!address) {
      await connectWithMetamask();
    }
    if (isMismatched && switchNetwork) {
      await switchNetwork(ChainId.Mumbai);
    }
    console.log("get event records that you have applied for participation");
    const eventManager = getEventManagerContract();
    if (!eventManager) throw "error";
    const data = await eventManager.getParticipationEventIds();
    console.log("retrieved:", data);
    setLoading(false);
    const _data = data.map((d: any) => d.toNumber());
    setEventIds(_data);
    return _data;
  };
  return { eventIds, loading, getParticipationEventIds };
};

/**
 * custom hook function for applying for participation
 * @returns
 */
export const useApplyForParticipation = () => {
  const [errors, setErrors] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const address = useAddress();
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithMetamask = useMetamask();
  const applyForParticipation = async (params: IApplyForParticipation) => {
    setErrors(null);
    try {
      setLoading(true);
      if (!address) {
        await connectWithMetamask();
      }
      if (isMismatched && switchNetwork) {
        await switchNetwork(ChainId.Mumbai);
      }
      const eventManager = getEventManagerContract();
      if (!eventManager) throw "error: contract can't found";
      const tx = await eventManager.applyForParticipation(params.eventId);
      await tx.wait();
      setLoading(false);
      setStatus(true);
    } catch (e: any) {
      setErrors(e);
      setLoading(false);
    }
  };
  return { status, errors, loading, applyForParticipation };
};
