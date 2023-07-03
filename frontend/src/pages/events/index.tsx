import {
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";
import EventCard from "../../components/atoms/events/EventCard";
import { useLocale } from "../../hooks/useLocale";
import { useEvents } from "src/hooks/useEvent";
import { Event } from "types/Event";

const Events: NextPage = () => {
  const { events, isLoading } = useEvents();
  const { t } = useLocale();

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading>{t.EVENTS}</Heading>
          <Spacer></Spacer>
          <Link href="/events/new">
            <Button>{t.CREATE_NEW_EVENT}</Button>
          </Link>
        </Flex>
        {isLoading ? (
          <Spinner></Spinner>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={5}>
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
                      ></EventCard>
                    </a>
                  </Link>
                );
              })}
            </>
          </SimpleGrid>
        )}
      </Container>
    </>
  );
};

export default Events;
