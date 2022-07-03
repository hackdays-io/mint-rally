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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  useGetEventById,
  useApplyForParticipation,
  useGetParticipationEventIds,
} from "../../hooks/useEventManager";
import { useMintParticipateNFT } from "../../hooks/useMintNFTManager";

const Event = () => {
  const router = useRouter();
  const { event, loading: loadingFetch, getEventById } = useGetEventById();

  const [eventIdNumber, setEventIdNumber] = useState<number | null>(null);

  const [participationCheckTimer, setParticipationCheckTimer] =
    useState<NodeJS.Timer | null>(null);

  const [showMintButton, setShowMintButton] = useState(false);

  const {
    status: applyStatus,
    errors: applyErrors,
    loading: applyLoading,
    applyForParticipation,
  } = useApplyForParticipation();

  const { getParticipationEventIds } = useGetParticipationEventIds();

  const {
    status: mintStatus,
    errors: mintErrors,
    loading: mintLoading,
    mintParticipateNFT,
  } = useMintParticipateNFT();

  const [enteredSecretPhrase, setEnteredSecretPhrase] = useState("");

  useEffect(() => {
    const { eventid } = router.query;
    if (eventid) {
      const id = Array.isArray(eventid) ? eventid[0] : eventid;
      setEventIdNumber(Number.parseInt(id, 10));
    }
  }, [router.query]);

  const check = useCallback(
    async function () {
      if (!eventIdNumber) return;
      console.log("getting participation evend ids...");
      const ids = await getParticipationEventIds();
      if (ids.includes(eventIdNumber)) {
        setShowMintButton(true);
        setParticipationCheckTimer(null);
        console.log("got");
        return;
      }
      const timer = setTimeout(check, 5000);
      setParticipationCheckTimer(timer);
    },
    [eventIdNumber, getParticipationEventIds]
  );

  useEffect(() => {
    if (event || !eventIdNumber || loadingFetch) {
      return;
    }

    getEventById({ eventId: eventIdNumber });
    const timer = setTimeout(check, 1000);
    setParticipationCheckTimer(timer);
  }, [
    eventIdNumber,
    getEventById,
    event,
    loadingFetch,
    getParticipationEventIds,
    check,
  ]);

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        <Heading>Event details</Heading>
        {loadingFetch && <Spinner></Spinner>}
        {event && (
          <Box padding={5}>
            <Link href={"event-groups/" + event.groupId.toString()}>
              Event Group ID: {event.groupId.toString()}
            </Link>
            <Flex>
              <Box w={200} fontWeight="bolder">
                Event name:
              </Box>
              <Box>{event.name}</Box>
            </Flex>
            <Flex>
              <Box w={200} fontWeight="bolder">
                Event description:
              </Box>
              <Box>{event.description}</Box>
            </Flex>
            <Flex>
              <Box w={200} fontWeight="bolder">
                Event date and time:
              </Box>
              <Box>
                {event.date + " " + event.startTime + " - " + event.endTime}
              </Box>
            </Flex>
            <Box mt={8} textAlign="center">
              {!showMintButton ? (
                <>
                  <Button
                    isLoading={applyLoading}
                    onClick={async () => {
                      await applyForParticipation({
                        eventId: event.eventRecordId,
                      });
                    }}
                  >
                    Apply
                  </Button>
                  {applyErrors && (
                    <Alert status="error" mt={2} mx={4}>
                      <AlertIcon />
                      <AlertTitle>Error occurred</AlertTitle>
                      <AlertDescription>{applyErrors.message}</AlertDescription>
                    </Alert>
                  )}
                  {applyStatus && (
                    <Alert status="success" mt={2} mx={4}>
                      <AlertIcon />
                      <AlertTitle>You have applied!</AlertTitle>
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  <Text>Enter secret phrase:</Text>
                  <Input
                    variant="outline"
                    type="password"
                    mb={4}
                    value={enteredSecretPhrase}
                    onChange={(e) => setEnteredSecretPhrase(e.target.value)}
                  />
                  <Button
                    isLoading={mintLoading}
                    onClick={async () => {
                      await mintParticipateNFT({
                        groupId: event.groupId,
                        eventId: (event.eventRecordId as any).toNumber(),
                        secretPhrase: enteredSecretPhrase,
                      });
                    }}
                  >
                    Claim NFT!
                  </Button>
                  {mintErrors && (
                    <Alert status="error" mt={2} mx={4}>
                      <AlertIcon />
                      <AlertTitle>Error occurred</AlertTitle>
                      <AlertDescription>{mintErrors.message}</AlertDescription>
                    </Alert>
                  )}
                  {mintStatus && (
                    <Alert status="success" mt={2} mx={4}>
                      <AlertIcon />
                      <AlertTitle>You have claimed NFT!</AlertTitle>
                    </Alert>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Event;
