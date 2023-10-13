import { Button, Img } from "@chakra-ui/react";
import {
  metamaskWallet,
  useConnect,
  useConnectionStatus,
} from "@thirdweb-dev/react";
import { FC } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useDeeplink2Metamask } from "src/hooks/useWallet";
import { chainId } from "src/libs/web3Config";

type Props = {
  buttonText?: string;
};

const MetamaskConnectButton: FC<Props> = ({ buttonText }) => {
  const { t } = useLocale();
  const metamaskConfig = metamaskWallet();
  const connect = useConnect();
  const connectionStatus = useConnectionStatus();
  const deeplink = useDeeplink2Metamask();

  const handleConnect = async () => {
    if (!window.ethereum) {
      deeplink();
      return;
    }
    await connect(metamaskConfig, { chainId: Number(chainId) });
  };

  const MetamaskIcon = () => (
    <Img src="/images/metamask.png" alt="metamask" width="20px" />
  );

  return (
    <Button
      w={280}
      leftIcon={<MetamaskIcon />}
      style={{
        fontWeight: "bold",
        backgroundColor: "#562406",
        color: "#fff",
      }}
      onClick={() => {
        handleConnect();
      }}
      disabled={["unknown", "connecting", "connected"].includes(
        connectionStatus
      )}
      isLoading={["connecting"].includes(connectionStatus)}
    >
      {buttonText || t.CONNECT_WITH_METAMASK}
    </Button>
  );
};
export default MetamaskConnectButton;
