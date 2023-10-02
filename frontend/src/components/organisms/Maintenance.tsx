import { FC, useEffect } from "react";
import { useIsPaused } from "src/hooks/useOperationController";
import ModalBase from "../molecules/common/ModalBase";
import { Box, Heading, Text, useDisclosure } from "@chakra-ui/react";
import { useLocale } from "src/hooks/useLocale";

export const Maintenance: FC = () => {
  const { isPaused, isLoading } = useIsPaused();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { t } = useLocale();

  useEffect(() => {
    if (isPaused && !isLoading) {
      onOpen();
    }
  }, [isPaused, isLoading]);

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <Box pt={10} pb={5}>
        <Heading textAlign="center" as="h3" fontSize="xl" mb={10}>
          🚧 {t.MAINTENANCE_TITLE} 🚧
        </Heading>
        <Text>{t.MAINTENANCE_DESC1}</Text>
        <Text mt={4}>{t.MAINTENANCE_DESC2}</Text>
      </Box>
    </ModalBase>
  );
};
