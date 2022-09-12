import { Text } from "@chakra-ui/react";
import { FC, ReactNode } from "react";
import { useAddress, useChainId } from "@thirdweb-dev/react";
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

  return (
    <>
      {!address ? (
        <Text fontSize="xl">Sign in first!</Text>
      ) : chainId !== requiredChainID ? (
        <Text fontSize="xl">
          Select the right network {chainId}. now ID is{" "}
          {process.env.NEXT_PUBLIC_CHAIN_ID}.
        </Text>
      ) : (
        children
      )}
    </>
  );
};
export default LoginRequired;
