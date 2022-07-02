import { useEffect, useState } from "react"
import { useAddress } from '@thirdweb-dev/react';

import { ethers } from 'ethers';

import contract from '../contracts/EventManager.json'
import { loadavg } from "os";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_EVENT_MANAGER!
console.log("address:", process.env.NODE_ENV)

interface IEventGroup {
  groupId: number;
  name: string;
}
interface IResponseEventGroups {
  data: IEventGroup[] | null;
  error: Error | null;
  loading: boolean;
}

const getContract = () => {
  const { ethereum } = window;
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum as any);
    const signer = provider.getSigner();
    if (signer) {
      console.log("address:", contractAddress)
      const _contract = new ethers.Contract(contractAddress, contract.abi, signer);
      console.log("Initialize payment");
      return _contract;
    }
  }
  return null;
}

export const useEventManager = () => {
  const [res, setRes] = useState<IResponseEventGroups>({ data: null, error: null, loading: false })
  useEffect(() => {
    getEventGroups()
  }, [])
  const getEventGroups = () => {
    const contract = getContract()
    setRes({ data: [], error: null, loading: false })
  }
  return res
}

export const useCreateGroup = async (name: string) => {
  const [res, setRes] = useState<IResponseEventGroups>({ data: null, error: null, loading: false })

  const address = useAddress();
  const _contract = getContract()
  if (!_contract) throw ('Can\'t get contract')
  await _contract.createGroup(name)
  console.log('created')
  setRes({ data: [], error: null, loading: false })
  return res;
}