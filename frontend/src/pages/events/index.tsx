import {
  Box,
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
import { useEventRecords } from "../../hooks/useEventManager";

const Events: NextPage = () => {
  const { records, loading } = useEventRecords();

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading>Events</Heading>
          <Spacer></Spacer>
          <Link href="/events/new">
            <Button>Create new event</Button>
          </Link>
        </Flex>
        {loading ? (
          <Spinner></Spinner>
        ) : (
          <SimpleGrid columns={3} spacing={5}>
            <>
              {records.map((item) => {
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
