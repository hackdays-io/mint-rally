import {
  Button,
  Container,
  Flex,
  Heading,
  Spacer,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";
import EventCard from "../../components/atoms/events/EventCard";
import { useLocale } from "../../hooks/useLocale";
import { useEvents } from "src/hooks/useEvent";
import { Event } from "types/Event";
import { Box } from "react-feather";
import Image from "next/image";

const Events: NextPage = () => {
  const { events, isLoading } = useEvents();
  const { t } = useLocale();

  return (
    <>
      <Box width="100%">
        <Image
          src="/images/events/image_17.jpg"
          alt="banner image"
          width={"100px"}
          height={"20px"}
        />
      </Box>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading
            color={"black"}
            fontSize={"3xl"}
            mb={5}
          >
            {t.EVENTS}
          </Heading>
          <Spacer></Spacer>
          <Link href="/events/new">
            <Button
              bg="#562406"
              color="white"
            >
              {t.CREATE_NEW_EVENT}
            </Button>
          </Link>
        </Flex>
        {isLoading ? (
          <Spinner></Spinner>
        ) : (
          <VStack spacing={5} align="stretch">
            <>
              {events.map((item: Event.EventRecord) => {
                return (
                  <Link
                    href={"/events/" + item.eventRecordId}
                    key={item.eventRecordId.toString()}
                  >
                    <a>
                      <EventCard
                        title={item.name}
                        description={item.description}
                        date={item.date}
                      ></EventCard>
                    </a>
                  </Link>
                );
              })}
            </>
          </VStack>
        )}
      </Container>
    </>
  );
};

export default Events;
