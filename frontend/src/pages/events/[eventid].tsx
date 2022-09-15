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
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Fragment, useState, useEffect, useMemo } from "react";
import { useGetEventById } from "../../hooks/useEventManager";
import {
  useMintParticipateNFT,
  useGetOwnedNFTs,
} from "../../hooks/useMintNFTManager";
import LoginRequired from "../../components/atoms/web3/LoginRequired";
import { useLocale } from "../../hooks/useLocale";
import { useReward } from "react-rewards";

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;
  const { event, loading: loadingFetch } = useGetEventById(Number(eventid));
  const { ownedNFTs, getOwnedNFTs } = useGetOwnedNFTs();
  const { t } = useLocale();
  const { reward: confettiReward } = useReward("confettiReward", "confetti", {
    elementCount: 100,
    lifetime: 300,
  });
  const { reward: balloonsReward } = useReward("balloonsReward", "balloons", {
    elementCount: 30,
    spread: 80,
  });

  const {
    status: mintStatus,
    errors: mintErrors,
    loading: mintLoading,
    mintedNftImageURL,
    mintParticipateNFT,
  } = useMintParticipateNFT();

  useEffect(() => {
    getOwnedNFTs();
  }, []);

  useEffect(() => {
    confettiReward();
    balloonsReward();
  }, [mintedNftImageURL]);

  const [enteredSecretPhrase, setEnteredSecretPhrase] = useState("");

  const claimMint = async () => {
    if (!event) return;
    await mintParticipateNFT({
      groupId: event.groupId.toNumber(),
      eventId: event.eventRecordId.toNumber(),
      secretPhrase: enteredSecretPhrase,
      mtx: event.useMtx,
    });
    // TODO: add event listener for minting
  };

  const hasNftForThisEvent = useMemo(() => {
    return ownedNFTs.some(
      (nft) =>
        !!event &&
        nft.traits.eventGroupId === event.groupId.toNumber() &&
        nft.name === event.name
    );
  }, [event, ownedNFTs]);

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
            <LoginRequired
              requiredChainID={+process.env.NEXT_PUBLIC_CHAIN_ID!}
              forbiddenText={t.SIGN_IN_TO_GET_NFT}
            >
              {mintedNftImageURL ? (
                <></>
              ) : hasNftForThisEvent || mintStatus ? (
                <Text>{t.YOU_ALREADY_HAVE_THIS_NFT}</Text>
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
                    <Text mb={2}>{t.ENTER_SECRET_PHRASE}</Text>
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
                    {t.CLAIM_NFT}
                    <Text as="span" fontSize="10px">
                      {event.useMtx ? t.USE_MTX : ""}
                    </Text>
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
                  <AlertTitle>{t.YOU_HAVE_CLAIMED_NFT}</AlertTitle>
                </Alert>
              )}
              {mintedNftImageURL && (
                <>
                  <Alert status="success" mt={3}>
                    <AlertIcon />
                    <AlertTitle>{t.YOU_HAVE_GOT_NFT}</AlertTitle>
                  </Alert>
                  <VStack justify="center" mt={5}>
                    <img src={mintedNftImageURL} width="200" height="200" />
                    <span id="confettiReward" />
                    <span id="balloonsReward" />
                  </VStack>
                </>
              )}
            </LoginRequired>
          </>
        )}
      </Container>
    </>
  );
};

export default Event;
