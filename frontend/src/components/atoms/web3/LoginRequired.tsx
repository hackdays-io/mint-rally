import { Button, Text } from "@chakra-ui/react";
import { FC, ReactNode } from "react";
import {
  ConnectWallet,
  useAddress,
  useChainId,
  useSwitchChain,
} from "@thirdweb-dev/react";
import { useLocale } from "../../../hooks/useLocale";

type Props = {
  children: ReactNode;
  requiredChainID: number;
  forbiddenText: string;
};

const LoginRequired: FC<Props> = ({
  children,
  requiredChainID,
  forbiddenText,
}) => {
  const address = useAddress();
  const chainId = useChainId()!;

  const { t } = useLocale();

  const switchNetwork = useSwitchChain();

  return (
    <>
      {!address ? (
        <>
          <Text mb={2}>{forbiddenText}</Text>
          <ConnectWallet btnTitle={t.SIGN_IN} style={{ fontWeight: "bold" }} />
        </>
      ) : chainId !== requiredChainID ? (
        <Text fontSize="xl">
          <Button onClick={() => switchNetwork(requiredChainID)}>
            {t.SWITCH_NETWORK}
          </Button>
        </Text>
      ) : (
        children
      )}
    </>
  );
};

export default LoginRequired;
