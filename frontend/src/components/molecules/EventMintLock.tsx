import { Box, Button, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC, useEffect } from "react";
import { useIsMintLocked, useMintLock } from "src/hooks/useMintNFT";
import AlertMessage from "../atoms/form/AlertMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";

type Props = {
  eventId: BigNumber;
};

const EventMintLock: FC<Props> = ({ eventId }) => {
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
      <Text fontWeight="bold">Mintロック設定</Text>
      <Text color="grey.600" fontSize="sm" mb={3}>
        ロック中は、NFTのMint（参加証明の受け取り）ができなくなります。
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
                  {isMintLocked ? "ロック中" : "ロックされていません"}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {isMintLocked
                    ? "NFTの配布をストップしています。"
                    : "NFTをMintすることが可能です。"}
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
              変更する
            </Button>
          </Flex>
        </Box>
      )}
      {error && (
        <AlertMessage title="MintLock中にエラーが発生しました">
          {(error as any).reason}
        </AlertMessage>
      )}
    </>
  );
};

export default EventMintLock;
