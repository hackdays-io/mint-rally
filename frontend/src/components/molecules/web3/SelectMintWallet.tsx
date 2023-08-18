import { FC, useState } from "react";
import { VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import MetamaskConnectButton from "src/components/atoms/web3/MetamaskConnectButton";
import MagicLinkConnectButton from "src/components/atoms/web3/MagicLinkConnectButton";
import { useLocale } from "src/hooks/useLocale";

const SelectMintWallet: FC = () => {
  const [magicLinkSelected, setMagicLinkSelected] = useState<boolean>(false);
  const { t } = useLocale();

  return (
    <VStack>
      {!magicLinkSelected && (
        <>
          <Text mb={4}>{t.SELECT_WALLET_NFT}</Text>
          <MetamaskConnectButton />
        </>
      )}
      <MagicLinkConnectButton selected={setMagicLinkSelected} />
    </VStack>
  );
};

export default SelectMintWallet;
