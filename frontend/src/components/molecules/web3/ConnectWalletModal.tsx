import { Box, Button, Grid, Text, useDisclosure } from "@chakra-ui/react";
import { FC, useState } from "react";
import MagicLinkConnectButton from "src/components/atoms/web3/MagicLinkConnectButton";
import MetamaskConnectButton from "src/components/atoms/web3/MetamaskConnectButton";
import SafeConnectButton from "src/components/atoms/web3/SafeConnectButton";
import WalletConnectButton from "src/components/atoms/web3/WalletConnectButton";
import { useLocale } from "src/hooks/useLocale";
import ModalBase from "../common/ModalBase";

type Props = {
  setConnecting: (connecting: boolean) => void;
};

export const ConnectWalletModal: FC<Props> = ({ setConnecting }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [magicLinkSelected, setMagicLinkSelected] = useState<boolean>(false);
  const [safeLinkSelected, setSafeLinkSelected] = useState<boolean>(false);

  const { t } = useLocale();

  return (
    <>
      <Button backgroundColor="yellow.900" color="white" onClick={onOpen}>
        {t.SIGN_IN}
      </Button>

      <ModalBase maxWidth="500px" onClose={onClose} isOpen={isOpen}>
        <Box mt={8} mb={4}>
          <Text mb={4} textAlign="center" fontWeight="bold" fontSize="xl">
            MintRally へようこそ
          </Text>
          <Grid gap={2} justifyContent="center">
            {!magicLinkSelected && !safeLinkSelected && (
              <MetamaskConnectButton />
            )}
            {!magicLinkSelected && !safeLinkSelected && <WalletConnectButton />}
            {!magicLinkSelected && (
              <SafeConnectButton
                selected={safeLinkSelected}
                setSelected={setSafeLinkSelected}
                setConnecting={setConnecting}
              />
            )}
            {!safeLinkSelected && (
              <MagicLinkConnectButton
                selected={magicLinkSelected}
                setSelected={setMagicLinkSelected}
              />
            )}
          </Grid>
        </Box>
      </ModalBase>
    </>
  );
};
