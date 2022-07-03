import { Heading, List, ListItem, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { IEventRecord, useEventRecords } from "../../hooks/useEventManager";

const Event = () => {
  const { records, loading, getEventRecords } = useEventRecords();
  useEffect(() => {
    getEventRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter();
  const { eventid } = router.query;

  return (
    <>
      <Heading>Event details</Heading>
      {loading && <Spinner></Spinner>}
      <List>
        {records
          .filter((item) => item.eventRecordId.toString() == eventid)
          .map((item) => {
            return (
              <>
                <ListItem key={"name-" + item.eventRecordId}>
                  {item.name}
                </ListItem>
                <ListItem key={"description-" + item.eventRecordId}>
                  {item.description}
                </ListItem>
              </>
            );
          })}
      </List>
    </>
  );
};

export default Event;
