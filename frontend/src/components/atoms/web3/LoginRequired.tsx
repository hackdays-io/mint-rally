import { Button, Text } from "@chakra-ui/react";
import { FC, ReactNode } from "react";
import { useAddress, useChainId } from "@thirdweb-dev/react";
import { useLocale } from "../../../hooks/useLocale";

export const switchNetwork = async () => {
  const requiredChainId = +process.env.NEXT_PUBLIC_CHAIN_ID!;
  const PRCURL = process.env.NEXT_PUBLIC_METAMASK_RPC_URL!;
  const ChainName = process.env.NEXT_PUBLIC_CHAIN_NAME!;
  const BlockExplorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL!;

  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + requiredChainId.toString(16) }],
      });
    } catch (error) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x" + requiredChainId.toString(16),
              blockExplorerUrls: [BlockExplorerUrl],
              chainName: ChainName,
              nativeCurrency: {
                decimals: 18,
                name: "Polygon",
                symbol: "MATIC",
              },
              rpcUrls: [PRCURL],
            },
          ],
        });
      } catch (error: any) {
        // user rejects the request to "add chain" or param values are wrong, maybe you didn't use hex above for `chainId`?
        console.log(`wallet_addEthereumChain Error: ${error.message}`);
      }
      // handle other "switch" errors
    }
  }
};

type Props = {
  children: ReactNode;
  requiredChainID: number;
  forbiddenText: string;
};
const LoginRequired: FC<Props> = ({
  children,
  requiredChainID,
  forbiddenText,
}: Props) => {
  const address = useAddress();
  const chainId = useChainId()!;

  const { t } = useLocale();

  return (
    <>
      {!address ? (
        <Text fontSize="xl">{forbiddenText}</Text>
      ) : chainId !== requiredChainID ? (
        <Text fontSize="xl">
          <Button onClick={switchNetwork}>{t.SWITCH_NETWORK}</Button>
        </Text>
      ) : (
        children
      )}
    </>
  );
};
export default LoginRequired;
