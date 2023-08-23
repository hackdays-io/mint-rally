import { FC, useState } from "react";
import { VStack } from "@chakra-ui/react";
import MetamaskConnectButton from "src/components/atoms/web3/MetamaskConnectButton";
import SafeConnectButton from "src/components/atoms/web3/SafeConnectButton";
import MagicLinkConnectButton from "src/components/atoms/web3/MagicLinkConnectButton";

type Props = {
  setConnecting: (connecting: boolean) => void;
};

const SelectConnectWallet: FC<Props> = ({ setConnecting }) => {
  const [magicLinkSelected, setMagicLinkSelected] = useState<boolean>(false);
  const [safeSelected, safeLinkSelected] = useState<boolean>(false);

  return (
    <VStack>
      {!magicLinkSelected && !safeSelected && <MetamaskConnectButton />}
      {!magicLinkSelected && (
        <SafeConnectButton
          selected={safeLinkSelected}
          setConnecting={setConnecting}
        />
      )}
      {!safeSelected && (
        <MagicLinkConnectButton selected={setMagicLinkSelected} />
      )}
    </VStack>
  );
};

export default SelectConnectWallet;
