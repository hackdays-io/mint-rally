import { getBlockNumber } from "@thirdweb-dev/sdk";
import { useEffect, useState } from "react";

export const useCurrentBlock = () => {
  const [currentBlock, setCurrentBlock] = useState<number>();

  useEffect(() => {
    const fetch = async () => {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
      const number = await getBlockNumber({
        network:
          chainId === "80001"
            ? "mumbai"
            : chainId === "137"
            ? "polygon"
            : "localhost",
      });
      setCurrentBlock(number);
    };
    fetch();
  }, []);

  return currentBlock;
};
