import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  List,
  ListItem,
  SimpleGrid,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useEffect } from "react";
import { Card } from "../../components/card";
import { IEventGroup, useEventGroups } from "../../hooks/useEventManager";

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
      <Container maxW={800} paddingTop={6}>
        <Flex alignItems="bottom" paddingBottom={6}>
          <Heading>Event Groups</Heading>
          <Spacer></Spacer>
          <Button
            onClick={() => {
              window.location.href = "/event-groups/new";
            }}
          >
            Create new event group
          </Button>
        </Flex>
        {loading ? (
          <Spinner></Spinner>
        ) : (
          <SimpleGrid columns={3} spacing={5}>
            <>
              {groups.map((item: IEventGroup) => {
                return (
                  <Card
                    key={item.groupId}
                    href={"/event-groups/" + item.groupId}
                    title={item.name}
                  ></Card>
                );
              })}
            </>
          </SimpleGrid>
        )}
      </Container>
    </>
  );
};

export default EventGroups;
