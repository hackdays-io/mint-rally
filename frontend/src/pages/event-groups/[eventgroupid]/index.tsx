import { Spinner, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import EventCard from "../../../components/atoms/events/EventCard";
import { useEventsByGroupId } from "src/hooks/useEvent";
import { Event } from "types/Event";
import EventGroupBase from "src/components/organisms/EventGroupBase";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
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

  return (
    <EventGroupBase>
      {eventLoading ? (
        <Spinner mt={5} />
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
    </EventGroupBase>
  );
};

export default EventGroup;
