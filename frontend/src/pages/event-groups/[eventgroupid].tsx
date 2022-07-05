import {
  Box,
  Container,
  Heading,
  Link,
  List,
  ListItem,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { Card } from "../../components/card";
import {
  IEventGroup,
  useEventGroups,
  useEventRecords,
} from "../../hooks/useEventManager";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;
  const { groups, loading, getEventGroups } = useEventGroups();
  const { records, loading: eventLoading, getEventRecords } = useEventRecords();

  const findgroup = useMemo(() => {
    return groups.find((item) => item.groupId.toString() == eventgroupid);
  }, [groups]);

  useEffect(() => {
    getEventGroups();
    getEventRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        {loading ? (
          <Spinner></Spinner>
        ) : (
          <>
            {findgroup && (
              <>
                <Heading mb={6}>{findgroup.name}</Heading>
                {eventLoading && <Spinner></Spinner>}
                <SimpleGrid columns={3} spacing={5}>
                  {records
                    .filter(
                      (findgroup) =>
                        findgroup.groupId.toString() == eventgroupid
                    )
                    .map((record) => {
                      return (
                        <Card
                          key={record.eventRecordId}
                          title={record.name}
                          href={"/events/" + record.eventRecordId}
                        ></Card>
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
