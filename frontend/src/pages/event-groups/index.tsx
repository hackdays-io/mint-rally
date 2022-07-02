import { Flex, Heading, Link, List, ListItem, Spinner } from "@chakra-ui/react";
import { NextPage } from "next";
import { useEffect } from "react";
import {
  IEventGroup,
  useEventGroups,
} from "../../hooks/useEventManagerContract";

/**
 * /event-groups/
 */
const EventGroups: NextPage = () => {
  const { groups, loading, getEventGroups } = useEventGroups();
  useEffect(() => {
    getEventGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Flex>
        <Link href="/event-groups/new">Create new EventGroup</Link>
      </Flex>
      <Heading>Event Groups</Heading>
      {loading ? (
        <Spinner></Spinner>
      ) : (
        <List spacing={3}>
          <>
            {groups.map((item: IEventGroup) => {
              return (
                <ListItem key={item.groupId}>
                  <Link href={"/event-groups/" + item.groupId}>
                    {item.name}
                  </Link>
                </ListItem>
              );
            })}
          </>
        </List>
      )}
    </>
  );
};

export default EventGroups;
