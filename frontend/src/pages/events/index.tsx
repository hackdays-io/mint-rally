import {
  Box,
  Flex,
  Heading,
  Link,
  List,
  ListIcon,
  ListItem,
  Spinner,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useEffect } from "react";
import {
  IEventRecord,
  useEventRecords,
} from "../../hooks/useEventManagerContract";

const Events: NextPage = () => {
  const { records, loading, getEventRecords } = useEventRecords();
  useEffect(() => {
    getEventRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Flex>
        <Link href="/events/new">Create new event</Link>
      </Flex>
      <Heading>Events</Heading>
      {loading && <Spinner></Spinner>}
      <List>
        {records.map((item) => {
          return (
            <ListItem key={item.eventRecordId}>
              <Link href={"/events/" + item.eventRecordId}>{item.name}</Link>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default Events;
