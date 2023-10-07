import { Button } from "@chakra-ui/react";
import { useConnectionStatus } from "@thirdweb-dev/react";
import { FC } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useWalletConnect } from "src/hooks/useWallet";

const WalletConnectButton: FC = () => {
  const { t } = useLocale();

  const connectionStatus = useConnectionStatus();
  const handleConnect = useWalletConnect();

  return (
    <Button
      w={280}
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
      {t.CONNECT_WITH_WALLETCONNECT}
    </Button>
  );
};

export default WalletConnectButton;
