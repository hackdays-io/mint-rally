import { Box, Button } from "@chakra-ui/react";
import {
  useConnectionStatus,
  useDisconnect,
  useWallets,
} from "@thirdweb-dev/react";
import { FC, useCallback, useMemo } from "react";
import { useLocale } from "src/hooks/useLocale";
import { useWalletConnect } from "src/hooks/useWallet";
import { useWeb3WalletConfig } from "src/libs/web3Config";
import { isMobile } from "utils/isMobile";

type Props = {
  selected: boolean;
  setSelected: (selected: boolean) => void;
  buttonText?: string;
};

const WalletConnectButton: FC<Props> = ({
  selected,
  setSelected,
  buttonText,
}) => {
  const { t } = useLocale();

  const disconnect = useDisconnect();
  const connectionStatus = useConnectionStatus();
  const { walletConnectConfig } = useWeb3WalletConfig();
  const handleWalletConnect = useWalletConnect();

  const wallets = useWallets();

  const WalletConnectUI = useMemo(() => {
    return wallets.find((wallet) => wallet.id === "walletConnect")?.connectUI;
  }, [wallets]);

  const handleConnect = useCallback(async () => {
    try {
      if (isMobile()) {
        handleWalletConnect();
      } else {
        setSelected(true);
      }
    } catch (_) {}
  }, [handleWalletConnect, setSelected]);

  return (
    <>
      {!selected && (
        <Button
          leftIcon={
            <Box as="img" src={walletConnectConfig.meta.iconURL} h={6} />
          }
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
          {buttonText || t.CONNECT_WITH_WALLETCONNECT}
        </Button>
      )}
      {WalletConnectUI && selected && (
        <WalletConnectUI
          close={() => {}}
          isOpen={true}
          open={() => {}}
          goBack={() => {
            setSelected(false);
            disconnect();
          }}
          walletConfig={walletConnectConfig as any}
          selectionData={() => {}}
          setSelectionData={() => {}}
          supportedWallets={[]}
          modalSize="compact"
          theme="light"
        />
      )}
    </>
  );
};

export default WalletConnectButton;
