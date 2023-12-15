import { InfoIcon } from "@chakra-ui/icons";
import { Box, Button, Text, useDisclosure } from "@chakra-ui/react";
import { FC } from "react";
import { useLocale } from "src/hooks/useLocale";
import ModalBase from "../common/ModalBase";

const AboutNFTMetadata: FC = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { t } = useLocale();

  return (
    <>
      <Button
        size="sm"
        borderRadius="full"
        colorScheme="mintGreen"
        onClick={onOpen}
      >
        <InfoIcon color="white" mr={1} />
        {t.ABOUT_METADATA}
      </Button>
      <ModalBase isOpen={isOpen} onClose={onClose}>
        <Box pt={8}>
          <Text mb={3}>{t.ABOUT_METADATA_DESC}</Text>

          <Box>
            <Text mb={1}>{t.ABOUT_METADATA_NAME}</Text>
            <Text mb={1}>{t.ABOUT_METADATA_DESCRIPTION}</Text>
            <Text mb={1}>{t.ABOUT_METADATA_IMAGE}</Text>
            <Text mb={1}>{t.ABOUT_METADATA_ANIMATION}</Text>
            <Text mb={1}>{t.ABOUT_METADATA_TRAITS}</Text>
          </Box>
        </Box>
      </ModalBase>
    </>
  );
};

export default AboutNFTMetadata;
