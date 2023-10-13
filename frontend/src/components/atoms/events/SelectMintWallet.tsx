import { FC, useState } from "react";
import { VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useLocale } from "src/hooks/useLocale";
import MagicLinkConnectButton from "../web3/MagicLinkConnectButton";
import MetamaskConnectButton from "../web3/MetamaskConnectButton";
import WalletConnectButton from "../web3/WalletConnectButton";
type Props = {
  allowMagicLink: boolean;
};

const SelectMintWallet: FC<Props> = ({ allowMagicLink }) => {
  const [magicLinkSelected, setMagicLinkSelected] = useState<boolean>(false);
  const [walletConnectSelected, setWalletConnectSelected] =
    useState<boolean>(false);
  const { t } = useLocale();

  return (
    <VStack>
      {!magicLinkSelected && !walletConnectSelected && (
        <>
          <Text mb={4} color="yellow.900" fontSize="md">
            {t.SELECT_WALLET}
          </Text>
          <MetamaskConnectButton buttonText={t.GET_NFT_USING_METAMASK} />
        </>
      )}
      {!magicLinkSelected && (
        <WalletConnectButton
          selected={walletConnectSelected}
          setSelected={setWalletConnectSelected}
          buttonText={t.GET_NFT_USING_WALLETCONNECT}
        />
      )}
      {!walletConnectSelected && (
        <>
          <MagicLinkConnectButton
            selected={magicLinkSelected}
            setSelected={setMagicLinkSelected}
            buttonText={t.GET_NFT_USING_EMAIL}
            disabled={!allowMagicLink}
          />
          {!allowMagicLink && (
            <Text fontSize="xs">{t.NOT_ALLOWED_MAGIC_LINK}</Text>
          )}
        </>
      )}
    </VStack>
  );
};

export default SelectMintWallet;
