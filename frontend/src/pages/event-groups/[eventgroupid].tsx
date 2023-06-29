import { Container, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import EventCard from "../../components/atoms/events/EventCard";
import { useLocale } from "../../hooks/useLocale";
import { useEventGroups, useEvents } from "src/hooks/useEvent";
import { Event } from "types/Event";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const { groups, isLoading } = useEventGroups();
  const { events, isLoading: eventLoading } = useEvents();
  const { t } = useLocale();
  const findgroup = useMemo(() => {
    return groups?.find(
      (item: Event.EventGroup) => item.groupId.toString() == eventgroupid
    );
  }, [groups]);

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        {isLoading ? (
          <Spinner></Spinner>
        ) : (
          <>
            {findgroup && (
              <>
                <Heading mb={6}>
                  {findgroup.name}
                  {t.OWN_EVENTS}
                </Heading>
                {eventLoading && <Spinner></Spinner>}
                <SimpleGrid columns={3} spacing={5}>
                  {events
                    .filter(
                      (findgroup: Event.EventRecord) =>
                        findgroup.groupId.toString() == eventgroupid
                    )
                    .map((event: Event.EventRecord) => {
                      return (
                        <Link
                          href={"/events/" + event.eventRecordId}
                          key={event.eventRecordId.toString()}
                        >
                          <a>
                            <EventCard
                              title={event.name}
                              description={event.description}
                            ></EventCard>
                          </a>
                        </Link>
                      );
                    })}
                </SimpleGrid>
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default EventGroup;
