import {
  Heading,
  Spinner,
  Box,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  Container,
  Flex,
  Link,
  Image,
  VStack,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { Fragment, useState, useEffect, useMemo } from "react";
import { useGetEventById } from "../../hooks/useEventManager";
import {
  useMintParticipateNFT,
  getMintNFTManagerContract,
  useGetOwnedNFTs,
} from "../../hooks/useMintNFTManager";
import dayjs from "dayjs";
import { useReward } from 'react-rewards';

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;
  const { event, loading: loadingFetch } = useGetEventById(Number(eventid));
  const {reward: confettiReward} = useReward('confettiReward', 'confetti');
  const {reward: balloonsReward} = useReward('balloonsReward', 'balloons');
  // const { ownedNFTs, loading, getOwnedNFTs } = useGetOwnedNFTs();

  const {
    status: mintStatus,
    errors: mintErrors,
    loading: mintLoading,
    mintedNftImageURL,
    mintParticipateNFT,
  } = useMintParticipateNFT();

  // useEffect(() => {
  //   getOwnedNFTs();
  // }, []);

  const [enteredSecretPhrase, setEnteredSecretPhrase] = useState("");

  const claimMint = async () => {
    if (!event) return;
    await mintParticipateNFT({
      groupId: event.groupId.toNumber(),
      eventId: event.eventRecordId.toNumber(),
      secretPhrase: enteredSecretPhrase,
    });
  };

  const emitConfetti = () => {
    confettiReward();
    balloonsReward();
  };

  useEffect(() => {
    emitConfetti();
  }, [mintedNftImageURL]);

  // const hasNftForThisEvent = useMemo(() => {
  //   return ownedNFTs.some(
  //     (nft) =>
  //       !!event &&
  //       nft.groupId.eq(event.groupId) &&
  //       nft.eventId.eq(BigNumber.from(eventid))
  //   );
  // }, [event, ownedNFTs]);

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        {loadingFetch && <Spinner></Spinner>}
        {event && (
          <>
            <Heading>{event.name}</Heading>
            <Text fontSize="24px">{event.date}</Text>

            <Text fontSize="16px" my={10}>
              {event.description.split(/(\n)/).map((item, index) => (
                <Fragment key={index}>
                  {item.match(/\n/) ? <br /> : item}
                </Fragment>
              ))}
            </Text>

            {/* {hasNftForThisEvent || mintStatus ? ( */}
            {mintStatus ? (
              <Text>
                You already have this NFT. Thank you for your participation!
              </Text>
            ) : (
              <Flex
                width="100%"
                justifyContent="space-between"
                alignItems="end"
                flexWrap="wrap"
              >
                <Box
                  width={{ base: "100%", md: "48%" }}
                  mb={{ base: 5, md: 0 }}
                >
                  <Text mb={2}>
                    Secret Phrase. Event organaizers will tell you.
                  </Text>
                  <Input
                    variant="outline"
                    type="password"
                    value={enteredSecretPhrase}
                    onChange={(e) => setEnteredSecretPhrase(e.target.value)}
                  />
                </Box>
                <Button
                  width={{ base: "100%", md: "48%" }}
                  isLoading={mintLoading}
                  onClick={() => claimMint()}
                  background="mint.primary"
                  color="white"
                  rounded="full"
                >
                  Claim NFT!
                </Button>
              </Flex>
            )}
            {mintErrors && (
              <Alert status="error" mt={2} mx={4}>
                <AlertIcon />
                <AlertTitle>Error occurred</AlertTitle>
                <AlertDescription>{mintErrors.message}</AlertDescription>
              </Alert>
            )}
            {mintStatus && !mintedNftImageURL && (
              <Alert status="success" mt={3}>
                <AlertIcon />
                <AlertTitle>You have claimed NFT! Please wait for `mint` your NFT... </AlertTitle>
              </Alert>
            )}
            {mintedNftImageURL && (
              <>
                <Alert status="success" mt={3}>
                  <AlertIcon />
                  <AlertTitle>Congratulations!!! You have got your NFT! </AlertTitle>
                </Alert>
                <VStack justify='center'>
                    <Image
                      src={mintedNftImageURL}
                      width="400"
                      height="400"
                      objectFit="contain"
                      alt="minted NFT"
                      onClick={() =>emitConfetti()}
                    />
                    <span id="confettiReward" />
                    <span id="balloonsReward" />
                </VStack>
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Event;
