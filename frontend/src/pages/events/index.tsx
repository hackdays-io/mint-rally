import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spacer,
  Spinner,
  VStack,
} from "@chakra-ui/react";

import EventCard from "../../components/atoms/events/EventCard";
import { Event } from "types/Event";
import { useLocale } from "../../hooks/useLocale";
import { useEvents } from "src/hooks/useEvent";

const Events: NextPage = () => {
  const {
    events,
    isLoading,
    prevCursor,
    nextCursor,
    countData,
    setCurrentCursor,
  } = useEvents();
  const { t } = useLocale();

  return (
    <>
      <Box width="100%" mb={6}>
        <div>
          <Image
            src="/images/events/listpage_header.jpg"
            alt="banner image"
            width={"1440px"}
            height={"240px"}
            layout="responsive"
          />
        </div>
      </Box>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading color={"black"} fontSize={"3xl"} mb={5}>
            {t.EVENTS}
          </Heading>
          <Spacer></Spacer>
          <Link href="/events/new">
            <Button bg="#562406" color="white">
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
                      />
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
