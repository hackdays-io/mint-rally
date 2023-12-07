import { Box, Button, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC, useEffect } from "react";
import { useIsMintLocked, useMintLock } from "src/hooks/useMintNFT";
import AlertMessage from "../atoms/form/AlertMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "src/hooks/useLocale";

type Props = {
  eventId: BigNumber;
};

const EventTransferLock: FC<Props> = ({ eventId }) => {
  const { t } = useLocale();
  const { isMintLocked, isLoading, refetch } = useIsMintLocked(eventId);

  const {
    lock,
    isLoading: isLocking,
    error,
    isSuccess,
    status,
  } = useMintLock(eventId, !isMintLocked);

  useEffect(() => {
    refetch();
  }, [status]);

  return (
    <>
      <Text fontWeight="bold">{t.EVENT_TRANSFERLOCK_SETTING}</Text>
      <Text color="grey.600" fontSize="sm" mb={3}>
        {t.EVENT_TRANSFERLOCK_SETTING_DESC}
      </Text>
      {isLoading ? (
        <Spinner />
      ) : (
        <Box>
          <Flex alignItems="center">
            <Flex
              borderRadius="full"
              backgroundColor="white"
              p={2}
              alignItems="center"
            >
              <Box
                as="span"
                color={isMintLocked ? "mintGreen.800" : "yellow.800"}
                background={isMintLocked ? "gray.300" : "yellow.300"}
                width="40px"
                height="40px"
                borderRadius="full"
                display="inline-flex"
                justifyContent="center"
                alignItems="center"
                mr={2}
              >
                <FontAwesomeIcon icon={isMintLocked ? faLock : faLockOpen} />
              </Box>
              <Box>
                <Text fontSize="sm" color="yellow.800">
                  {isMintLocked
                    ? t.EVENT_ISNONTRANSFERABLE_TRUE
                    : t.EVENT_ISNONTRANSFERABLE_FALSE}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {isMintLocked
                    ? t.EVENT_ISNONTRANSFERABLE_TRUE_DESC
                    : t.EVENT_ISNONTRANSFERABLE_FALSE_DESC}
                </Text>
              </Box>
            </Flex>
            <Button
              ml={3}
              size="sm"
              disabled={isLocking}
              isLoading={isLocking}
              onClick={() => lock()}
              backgroundColor="transparent"
              border="1px solid"
              borderColor="yellow.800"
              color="yellow.800"
            >
              {t.EVENT_ADMIN_SUBMIT}
            </Button>
          </Flex>
        </Box>
      )}
      {error && (
        <AlertMessage title={t.EVENT_TRANSFERLOCK_FAIL}>
          {(error as any).reason}
        </AlertMessage>
      )}
    </>
  );
};

export default EventTransferLock;
