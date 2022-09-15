import { Box, Button, Heading, Text, useDisclosure } from "@chakra-ui/react";
import { useMetamask } from "@thirdweb-dev/react";
import { FC, useEffect } from "react";
import { useLocale } from "../../../hooks/useLocale";
import ModalBase from "../common/ModalBase";

const InstallWalletAlert: FC = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const connectWithMetamask = useMetamask();
  const { t } = useLocale();

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) {
      onOpen();
    }
  }, []);

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="450px">
      <Box py={5}>
        <Heading as="h2" fontWeight="bold" fontSize="18px" mb={5}>
          🦊{t.INSTALL_METAMASK_TITLE}
        </Heading>
        <Text fontSize="15px" mb={2}>
          {t.INSTALL_METAMASK_NEED}
        </Text>
        <Text fontSize="15px" mb={5}>
          {t.INSTALL_METAMASK_DESC}
        </Text>

        <Button
          backgroundColor="mint.bg"
          width="full"
          onClick={() => connectWithMetamask()}
        >
          {t.INSTALL_METAMASK_BUTTON}
        </Button>
      </Box>
    </ModalBase>
  );
};

export default InstallWalletAlert;
