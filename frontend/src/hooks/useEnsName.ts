import { useState } from "react";

export const useEnsName = (address: string) => {
  const [ensName, setEnsName] = useState<string | null>(address);

  return { ensName, setEnsName };
};