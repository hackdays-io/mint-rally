import { ethers } from "ethers";
import { useState } from "react";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_EVENT_MANAGER!
import contract from '../contracts/EventManager.json'
export interface IEventGroup {
  groupId: number;
  name: string;
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

export const useEventGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false)
  const getEventGroups = async () => {
    console.log("get event groups");
    const eventManager = getEventManagerContract();
    if (!eventManager) throw "error";
    setLoading(true)
    const data = await eventManager.getGroups();
    setLoading(false)
    setGroups(data);
  };
  return { groups, loading, getEventGroups }
}