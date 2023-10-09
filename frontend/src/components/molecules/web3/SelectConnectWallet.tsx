import { FC, useState } from "react";
import { VStack } from "@chakra-ui/react";
import MetamaskConnectButton from "src/components/atoms/web3/MetamaskConnectButton";
import SafeConnectButton from "src/components/atoms/web3/SafeConnectButton";
import MagicLinkConnectButton from "src/components/atoms/web3/MagicLinkConnectButton";
import WalletConnectButton from "src/components/atoms/web3/WalletConnectButton";

type Props = {
  setConnecting: (connecting: boolean) => void;
};

const SelectConnectWallet: FC<Props> = ({ setConnecting }) => {
  const [magicLinkSelected, setMagicLinkSelected] = useState<boolean>(false);
  const [walletConnectSelected, setWalletConnectSelected] =
    useState<boolean>(false);
  const [safeSelected, safeLinkSelected] = useState<boolean>(false);

  return (
    <VStack>
      {!magicLinkSelected && !safeSelected && !walletConnectSelected && (
        <MetamaskConnectButton />
      )}
      {!magicLinkSelected && !safeSelected && (
        <WalletConnectButton
          selected={walletConnectSelected}
          setSelected={setWalletConnectSelected}
        />
      )}
      {!magicLinkSelected && !walletConnectSelected && (
        <SafeConnectButton
          selected={safeSelected}
          setSelected={safeLinkSelected}
          setConnecting={setConnecting}
        />
      )}
      {!safeSelected && !walletConnectSelected && (
        <MagicLinkConnectButton
          selected={magicLinkSelected}
          setSelected={setMagicLinkSelected}
        />
      )}
    </VStack>
  );
};

export default SelectConnectWallet;
