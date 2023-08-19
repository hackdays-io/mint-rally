import { useEffect, useState } from "react";
import { ethers } from "ethers";

export const useEnsName = (address: string) => {
  const [ensName, setEnsName] = useState<string | null>(address);
  // get the ENS name from addresss using ethers.js
  useEffect(() => {
    const provider = new ethers.providers.AlchemyProvider("homestead", process.env.NEXT_PUBLIC_ALCHEMY_KEY_FOR_ENS!);
    provider.lookupAddress(address).then((ensName) => { setEnsName(ensName); }).catch((err) => console.log(err));
  }, [address]);
  return { ensName, setEnsName };
};