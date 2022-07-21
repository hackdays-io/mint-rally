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
import { Fragment, useState } from "react";
import { useGetEventById } from "../../hooks/useEventManager";
import { useMintParticipateNFT } from "../../hooks/useMintNFTManager";
import dayjs from "dayjs";

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;
  const { event, loading: loadingFetch } = useGetEventById(Number(eventid));

  const {
    status: mintStatus,
    errors: mintErrors,
    loading: mintLoading,
    mintParticipateNFT,
  } = useMintParticipateNFT();

  const [enteredSecretPhrase, setEnteredSecretPhrase] = useState("");

  const claimMint = async () => {
    if (!event) return;
    await mintParticipateNFT({
      groupId: event.groupId.toNumber(),
      eventId: event.eventRecordId.toNumber(),
      secretPhrase: enteredSecretPhrase,
    });
  };

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        {loadingFetch && <Spinner></Spinner>}
        {event && (
          <>
            <Heading>{event.name}</Heading>
            <Text fontSize="24px">
              {dayjs(event.date).format("YYYY/M/D (ddd)")} {event.startTime}~
              {event.endTime}
            </Text>

            <Text fontSize="16px" my={10}>
              {event.description.split(/(\n)/).map((item, index) => (
                <Fragment key={index}>
                  {item.match(/\n/) ? <br /> : item}
                </Fragment>
              ))}
            </Text>

            <Flex
              width="100%"
              justifyContent="space-between"
              alignItems="end"
              flexWrap="wrap"
            >
              <Box width={{ base: "100%", md: "48%" }} mb={{ base: 5, md: 0 }}>
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
            {mintErrors && (
              <Alert status="error" mt={2} mx={4}>
                <AlertIcon />
                <AlertTitle>Error occurred</AlertTitle>
                <AlertDescription>{mintErrors.message}</AlertDescription>
              </Alert>
            )}
            {mintStatus && (
              <Alert status="success" mt={3}>
                <AlertIcon />
                <AlertTitle>You have claimed NFT!</AlertTitle>
              </Alert>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Event;
