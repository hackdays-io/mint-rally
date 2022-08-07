import { Container, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import EventCard from "../../components/atoms/events/EventCard";
import { useEventGroups, useEventRecords } from "../../hooks/useEventManager";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const { groups, loading } = useEventGroups();
  const { records, loading: eventLoading } = useEventRecords();

  const findgroup = useMemo(() => {
    return groups.find((item) => item.groupId.toString() == eventgroupid);
  }, [groups]);

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        {loading ? (
          <Spinner></Spinner>
        ) : (
          <>
            {findgroup && (
              <>
                <Heading mb={6}>Events of {findgroup.name}</Heading>
                {eventLoading && <Spinner></Spinner>}
                <SimpleGrid columns={3} spacing={5}>
                  {records
                    .filter(
                      (findgroup) =>
                        findgroup.groupId.toString() == eventgroupid
                    )
                    .map((record) => {
                      return (
                        <Link
                          href={"/events/" + record.eventRecordId}
                          key={record.eventRecordId.toString()}
                        >
                          <a>
                            <EventCard
                              title={record.name}
                              description={record.description}
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
