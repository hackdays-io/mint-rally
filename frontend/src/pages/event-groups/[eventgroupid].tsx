import {
  Box,
  Container,
  Heading,
  Link,
  List,
  ListItem,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
  useEffect(() => {
    getEventGroups();
    getEventRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {loading ? (
        <Spinner></Spinner>
      ) : (
        <List spacing={3}>
          <>
            {groups
              .filter((item) => item.groupId.toString() == eventgroupid)
              .map((item: IEventGroup) => {
                return (
                  <>
                    <Box key={item.groupId}>
                      <Heading>{item.name}</Heading>
                      {eventLoading && <Spinner></Spinner>}
                      <List>
                        {records
                          .filter(
                            (item) => item.groupId.toString() == eventgroupid
                          )
                          .map((record) => {
                            return (
                              <ListItem key={record.eventRecordId}>
                                <Link href={"/events/" + record.eventRecordId}>
                                  {record.name}
                                </Link>
                              </ListItem>
                            );
                          })}
                      </List>
                    </Box>
                  </>
                );
              })}
          </>
        </List>
      )}
    </>
  );
};

export default EventGroup;
