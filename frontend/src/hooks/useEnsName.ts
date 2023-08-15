import { useState } from "react";

export const useEnsName = (address: string) => {
  const [ensName, setEnsName] = useState<string | null>(address);
  // @todo - implement ENS lookup
  // get the ENS name from addresss using ethers.js

  return { ensName, setEnsName };
};