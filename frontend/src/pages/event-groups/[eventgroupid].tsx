import { Container, Heading, Spinner, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import EventCard from "../../components/atoms/events/EventCard";
import { useLocale } from "../../hooks/useLocale";
import {
  useEventGroups,
  useEvents,
  useEventsByGroupId,
} from "src/hooks/useEvent";
import { Event } from "types/Event";
import ENSName from "src/components/atoms/web3/ENSName";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const { groups, isLoading } = useEventGroups();
  const {
    events,
    isLoading: eventLoading,
    getEventsByGroupId,
  } = useEventsByGroupId();
  useEffect(() => {
    if (router.isReady && eventgroupid) {
      getEventsByGroupId(Number(eventgroupid));
    }
  }, [router.query?.eventgroupid]);
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
                <Text mb={6}>
                  {t.ORGANIZER}:{" "}
                  <ENSName
                    address={findgroup.ownerAddress}
                    enableEtherScanLink={true}
                  />
                </Text>
                {eventLoading ? (
                  <Spinner />
                ) : (
                  <VStack spacing={5} align="stretch">
                    {events?.map((event: Event.EventRecord) => {
                      return (
                        <Link
                          href={"/events/" + event.eventRecordId}
                          key={event.eventRecordId.toString()}
                        >
                          <a>
                            <EventCard
                              title={event.name}
                              description={event.description}
                              date={event.date}
                            ></EventCard>
                          </a>
                        </Link>
                      );
                    })}
                  </VStack>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default EventGroup;
