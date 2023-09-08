import { FC, useState } from "react";
import { VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useLocale } from "src/hooks/useLocale";
import GetWithMetamaskButton from "./GetWithMetamaskButton";
import GetWithMagicLinkButton from "./GetWithMagicLinkButton";
type Props = {
  allowMagicLink: boolean;
};

const SelectMintWallet: FC<Props> = ({ allowMagicLink }) => {
  const [magicLinkSelected, setMagicLinkSelected] = useState<boolean>(false);
  const { t } = useLocale();

  return (
    <VStack>
      {!magicLinkSelected && (
        <>
          <Text mb={4} color="yellow.900" fontSize="md">
            {t.SELECT_WALLET}
          </Text>
          <GetWithMetamaskButton />
        </>
      )}
      <GetWithMagicLinkButton
        selected={setMagicLinkSelected}
        disabled={!allowMagicLink}
      />
    </VStack>
  );
};

export default SelectMintWallet;
